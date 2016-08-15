'use strict';

module.exports = {
    ENV: 'development',
    LOG_LEVEL: 'info',

    CORS: {
        allowed_headers: 'Content-Type, Accept',
        allowed_origins: 'http://cdi.ph',
        allowed_methods: 'GET, POST, PUT, OPTIONS, DELETE'
    },

    MASTER_DB: {
        host: 'AMAZON_RDS_HOST',
        user: '',
        password: '',
        database: 'cdi'
    }
};