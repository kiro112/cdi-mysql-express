'use strict';

// import config       from  __dirname + '/config/config';
// import util         from  __dirname + '/helpers/util';
const mysql       = require('anytv-node-mysql');
const body_parser = require('body-parser');
const winston     = require('winston');
const express     = require('express');

let app,
    handler;

function start() {
    if (handler) {
        handler.close();
    }

    app = express();

    // set config
    config.use(procces.env.NODE_ENV);
    app.set('env', config.ENV);

    // set logger
    winston.cli();
    winston.level = config.LOG_LEVEL || 'silly';

    // set mysql
    mysql.set_logger(winston)
         .add('master', config.MASTER_DB);

    winston.log('info', 'Starting', config.APP_NAME, 'on', config.ENV, 'environment');
    
    winston.log('verbose', 'Binding 3rd-party middlewares');
    app.use(require('helmet'));
    app.use(require('method-override')());
    app.use(body_parser.urlencoded({extended: false}));
    app.use(body_parser.json());
    app.use(require('compression')());

    winston.log('verbose', 'Binding custom middlewares');
    app.use(require('anytv-node-cors')(config.CORS));
    app.use(require('anytv-node-error-handler')(winston));
    app.use(require(__dirname + '/config/router')(express.Router()));

    winston.log('info', 'Server listening on port', config.PORT);

    return app.listen(config.PORT);
}

module.exports = {
    app,
    start,
    handler
};