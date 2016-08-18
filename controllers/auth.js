'use strict';

const mysql       = require('anytv-node-mysql');
const winston     = require('winston');
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

        mysql.use('master')
            .query(
                ['SELECT id, IF(PASSWORD(CONCAT(MD5(?), ?))',
                '= password, TRUE, FALSE) AS isPasswordValid,',
                'email, fullname FROM users',
                'WHERE email LIKE ?'].join(' '),
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

        req.redis.sadd(user.id.toString(), token);

        res.set('x-access-token', token)
           .item(data)
           .send();

    }

    start();
};

exports.logout = (req, res, next) => {
    let body  = req.body,
        token = body.token,
        id    = body.user.id.toString();

    if (token) {
        req.redis.srem(id, token);
        res.item({message: 'User successfully logged out'})
           .send();
    } else {
        res.error('NO_TOKEN', 'Please provide valid token in body form')
           .status(403)
           .send();
    }
};

exports.verify_token = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'],
        _id   = req.body._id   || req.query._id   || req.headers['x-access-id'] || null;

    if (token) {
        jwt.verify(token, config.SECRET, (err, user) => {
            if (err || user.id !== _id) return res.status(404)
                               .error('UNAUTH', 'Failed to authenticate token.')
                               .send();
            else {
                const redis = req.redis;
                redis.sismember(user.id.toString(), token, (err, isMember) => {
                    if (err || !isMember) {
                        return res.status(404)
                               .error('UNAUTH', 'Failed to authenticate token.')
                               .send();
                    }
                    req.body.user  = user;
                    req.body.token = token;
                    next();
                });
            }
        });
    } else {
        res.error('NO_TOKEN', 'Please provide valid token in body form')
           .status(403)
           .send();
    }

};