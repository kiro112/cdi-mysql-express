'use strict';

const mysql     = require('anytv-node-mysql');
const winston   = require('winston');
const util      = require(__dirname + '/../helper/util');


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
    let body = req.body;

    function start() {

        mysql.use('master')
        .query (
            ['SELECT * FROM user',
             'WHERE user.email = ? '].join(' '),
             body.email,
             create_user
        )
        .end();
    }

    function create_user (err, result, args, last_query) {
        if (err) {
            winston.error('Error in getting user', err, last_query);
            return next(err);
        }

        if (result[0].id) {
            return res.error('INVALID_EMAIL', 'Email is already in use');
        }

        mysql.use('master')
        .query (
            ['INSERT INTO user(email, password, fullname)',
             'VALUES (?, ?, ?)'].join(' '),
             [body.email, body.password, body.fullname],
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
            id:         result[0].id,
            email:      body.email,
            password:   body.password
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
        mysql.use('my_db')
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
                .error({'USER404', 'User not found'})
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
            password: '',
            fullname: ''
        })
        .from(req.body);

    function start() {
        mysql.use('master')
        .query (
            ['UPDATE user SET ? WHERE id=?'].join(' '),
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
            ["UPDATE user SET deleted=NOW()",
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