'use strict';

const mysql       = require('anytv-node-mysql');
const winston     = require('winston');
const jwt         = require('jsonwebtoken');
const util        = require(__dirname + '/../helpers/util');
const config      = require(__dirname + '/../config/config');
const crypto      = require(__dirname + '/../lib/cryptography');

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

        data.email = data.email.toLowerCase();

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
        let user,
            token,
            encrypted = {};

        if (err) {
            winston.error('Error in logging in', last_query);
            return next(err);
        }

        if (!result.length) {
            return res.error('LOG_FAIL', 'Invalid username');
        }

        if (!result[0].isPasswordValid) {
            return res.error('LOG_FAIL', 'Incorrect Password');
        }

        user = {
            id:     result[0].id,
            email:  result[0].email
        };

        encrypted.user = crypto.encryptSync(user);

        token = jwt.sign(encrypted, config.SECRET, {
                        algorithm: config.TOKEN_ALGO,
                        expiresIn: config.TOKEN_EXPIRATION
                    });

        user.token = token;

        req.redis.sadd(user.id.toString(), token);

        res.set('x-access-token', token)
           .item(user)
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
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {

        jwt.verify(token, config.SECRET, {algorithms : [config.TOKEN_ALGO]}, (err, user) => {

            if (err) {
                return res.status(404)
                          .error('UNAUTH', 'Failed to authenticate token.')
                          .send();
            } else {

                const decrypted = crypto.decryptSync(user.user),
                      redis     = req.redis,
                      userId    = decrypted.id.toString();

                redis.sismember(userId, token, (err, isMember) => {
                    if (err || !isMember) {
                        return res.status(404)
                                  .error('UNAUTH', 'Failed to authenticate token.')
                                  .send();
                    }
                    req.body.user  = decrypted;
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