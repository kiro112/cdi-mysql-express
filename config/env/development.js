'use strict';

module.exports = {
    ENV: 'development',

    CORS: {
        allowed_headers: 'Content-Type, Accept',
        allowed_origins_list: [
            'cdi.loc',
            'localhost'
        ],
        allowed_methods: 'GET, POST, PUT, DELETE',
        allow_credentials: true
    },

    MASTER_DB: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'test'
    }
};