'use strict';

const jwt         = require('jsonwebtoken');
const util        = require(__dirname + '/../helpers/util');
const config      = require(__dirname + '/../config/config');

exports.login = (req, res, next) => {
    const data = util._get
        .form_data({
            email: '',
            password: ''
        })
        .from(req.body);

    function start (query_id) {

        if (data instanceof Error) {
            return res.error('INC_DATA', data.message);
        }

        mysql.use('slave_others')
            .query(
                ['SELECT id, IF(PASSWORD(CONCAT(MD5(?), ?))',
                '= password, TRUE, FALSE) AS isPasswordValid',
                'email, fullname FROM users',
                'WHERE email = ?'].join(' '),
                [data.password, config.SALT, data.email],
                send_response
            )
            .end();
    }

    function send_response (err, result, args, last_query) {
        let user;

        if (err) {
            winston.error('Error in logging in', last_query);
            return next(err);
        }

        if (!result.length) {
            return res.error('LOG_FAIL', 'Invalid username');
        }

        user = result[0];

        if (!user.isPasswordValid) {
            return res.error('LOG_FAIL', 'Incorrect Password');
        }

        let token = jwt.sign(user, config.SECRET, {
                        expiresIn: config.TOKEN_EXPIRATION
                    });

        let data = {
            id:         user.id,
            email:      user.email,
            password:   user.password,
            token:      token
        };

        req.redis.set(token, user.id.toString());

        res.set('x-access-token', token)
           .item(data)
           .send();

    }

    start();
};

exports.logout = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        req.redis.del(token);
        res.item({message: 'User successfully logged out'})
           .send();
    } else {
        res.error({message: 'invalid token'})
           .status(403)
           .send();
    }
};

exports.verify_token = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.SECRET, (err, user) => {
            if (err) return res.status(404)
                               .error('UNAUTH', 'Failed to authenticate token.')
                               .send();
            else {
                const redis = req.redis;
                redis.get(token, (err, userId) => {
                    if (err || user.id !== userId) {
                        return res.status(404)
                               .error('UNAUTH', 'Failed to authenticate token.')
                               .send();
                    } 
                    req.user = user;
                    next();
                });
            }
        });
    } else {
        res.error({message: 'invalid token'})
           .status(403)
           .send();
    }

};