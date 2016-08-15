'use strict';

const _       = require('lodash');
const path    = require('path');

const config = {
    APP_NAME: 'CDI App Name',

    FRONTEND_URL: 'cdi.loc',

    PORT: 8000,

    SALT: 'NaCl',

    UPLOAD_DIR: path.normalize(__dirname + '/../uploads/'),
    ASSETS_DIR: path.normalize(__dirname + '/../assets'),
    VIEWS_DIR: path.normalize(__dirname + '/../views'),
    LOGS_DIR: path.normalize(__dirname + '/../logs'),

    use: (env) => {
        _.assign(config, require(__dirname + '/env/' + env));
        return config;
    },

};

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

module.exports = config.use(process.env.NODE_ENV);