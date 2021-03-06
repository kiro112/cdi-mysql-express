'use strict';

const mysql     = require('anytv-node-mysql');
const winston   = require('winston');
const util      = require(__dirname + '/../helpers/util');
const config    = require(__dirname + '/../config/config');


/**
 * @api {post} /user Create user
 * @apiName Create
 * @apiGroup User
 *
 * @apiParam {String} password    User's password
 * @apiParam {String} email       User's email
 * @apiParam {String} fullname    User's fullname
 *
 * @apiSuccess {String} id User's unique ID
 * @apiSuccess {String} email User's unique email
 * @apiSuccess {String} password User's password
 * @apiSuccess {String} date_created Time when the user was created
 * @apiSuccess {String} date_updated Time when last update occurred
 */
exports.create = (req, res, next) => {
    const data = util._get
        .form_data({
            email: '',
            password: '',
            fullname: ''
        })
        .from(req.body);

    function start() {

        if (data instanceof Error) {
            return res.error('INC_DATA', data.message);
        }

        mysql.use('master')
        .query (
            ['SELECT * FROM users',
             'WHERE email = ? '].join(' '),
             data.email,
             create_user
        )
        .end();
    }

    function create_user (err, result, args, last_query) {
        if (err) {
            winston.error('Error in getting user', err, last_query);
            return next(err);
        }

        if (result.length) {
            return res.error('INVALID_EMAIL', 'Email is already in use');
        }

        mysql.use('master')
        .query (
            ['INSERT INTO users(email, password, fullname)',
             'VALUES (?, PASSWORD(CONCAT(MD5(?), ?)), ?)'].join(' '),
             [data.email, data.password, config.SALT, data.fullname],
             send_response
        )
        .end();

    }

    function send_response (err, result, args, last_query) {
        if (err) {
            winston.error('Error in creating user', last_query);
            return next(err);
        }

        if (!result.affectedRows) {
            return res.error('NO_RECORD_CREATED', 'No user was created');
        }

        res.item({
            message: 'Successfully created user',
            id:         result.insertId,
            email:      data.email,
            password:   data.password
        })
        .send();
    }

    start();
};

/**
 * @api {get} /user/:id Get user information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {String} id User's unique ID
 *
 * @apiSuccess {String} id User's unique ID
 * @apiSuccess {String} email User's unique email
 * @apiSuccess {String} password User's password
 * @apiSuccess {String} fullname User's fullname
 * @apiSuccess {String} date_created Time when the user was created
 * @apiSuccess {String} date_updated Time when last update occurred
 */
exports.retrieve = (req, res, next) => {

    function start () {
        mysql.use('master')
            .query(
                'SELECT * FROM users WHERE id = ? LIMIT 1;',
                [req.params.id],
                send_response
            )
            .end();
    }

    function send_response (err, result, args, last_query) {
        if (err) {
            winston.error('Error in selecting users', last_query);
            return next(err);
        }

        if (!result.length) {
            return res.status(404)
                .error('ZERO_RES', 'User not found')
                .send();
        }

        res.item(result[0])
            .send();
    }

    start();
};

/**
 * @api {put} /user/:id Update user information
 * @apiName Update
 * @apiGroup User
 *
 * @apiParam {String} id User's unique ID
 *
 * @apiSuccess {String} id User's unique ID
 * @apiSuccess {String} email User's unique email
 * @apiSuccess {String} password User's password
 * @apiSuccess {String} fullname User's fullname
 */
exports.update = (req, res, next) => {
    const data = util._get
        .form_data({
            email: '',
            fullname: ''
        })
        .from(req.body);

    function start() {

        if (data instanceof Error) {
            return res.error('INC_DATA', data.message);
        }

        data.date_updated = new Date();

        mysql.use('master')
        .query (
            ['SELECT * FROM users',
             'WHERE id != ? AND email = ? '].join(' '),
             [req.params.id, data.email],
             update_user
        )
        .end();
    }

    function update_user (err, result, args, last_query) {
        if (err) {
            winston.error('Error in getting user', err, last_query);
            return next(err);
        }

        if (result.length) {
            return res.error('INVALID_EMAIL', 'Email is already in use');
        }

        mysql.use('master')
        .query (
            ['UPDATE users SET ? WHERE id=?'].join(' '),
            [data, req.params.id],
            send_response
        )
        .end();

    }

    function send_response (err, result, args, last_query) {
        if (err) {
            winston.error('Error in update user', last_query);
            return next(err);
        }

        if (!result.affectedRows) {
            return res.error('NO_RECORD_UPDATED', 'No user was updated');
        }

        data.id = req.params.id;

        res.item(data)
           .send();
    }

    start();
};

/**
 * @api {delete} /user/:id Delete user
 * @apiName Delete
 * @apiGroup User
 *
 * @apiParam {String} id User's unique ID
 *
 * @apiSuccess {String} message Successfully deleted user
 */
exports.delete = (req, res, next) => {

    function start () {

        mysql.use('master')
        .query (
            ["UPDATE users SET deleted=NOW()",
            "WHERE deleted IS NULL AND id=?"].join(' '),
            [req.params.id],
            send_response
        )
        .end();
    }

    function send_response (err, result, args, last_query) {
        if (err) {
            winston.error('Error in retrieving user', last_query);
            return next(err);
        }

        if (result.affectedRows === 0) {
            return res.error('NO_RECORD_DELETED', 'No User was deleted');
        }

        res.item({message: 'Successfully deleted user'})
           .send();
    }

    start();

};


exports.change_password = (req, res, next) => {
    const body  = req.body,
          redis = req.redis,
          id    = body.user.id,
          data  = util._get
                    .form_data({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    })
                    .from(req.body);
          

    function start () {

        if (data instanceof Error) {
            return res.error('INC_DATA', data.message);
        }

        if (data.newPassword != data.confirmPassword) {
            return res.error('INV_PASS', 'Invalid password confirmation');
        }

        mysql.use('master')
        .query(
            'UPDATE users SET password = PASSWORD(CONCAT(MD5(?), ?)), date_updated = NOW() WHERE password = PASSWORD(CONCAT(MD5(?), ?)) AND id = ? LIMIT 1;',
            [data.newPassword, config.SALT, data.currentPassword, config.SALT, id],
            send_response
        )
        .end();

    }

    function send_response (err, result, args, last_query) {
        if (err) {
            winston.error('Error in retrieving user', last_query);
            return next(err);
        }

        if (result.affectedRows === 0) {
            return res.error('NO_PASS', 'Please check current password');
        }

        // Delete all active tokens
        // and remain the current one
        redis.del(id.toString());
        redis.sadd(id.toString(), body.token);

        res.item({message: 'Password successfully updated'})
           .send();
    }

    start();
};