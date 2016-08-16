'use strict';

const redis         = require('redis');
const config        = require(__dirname + '/../config/config').REDISDB;

module.exports = () => {
    return (req, res, next) => {
        const client = redis.createClient(config.port, config.host);

        client.on('error', (err) =>{
            return next(err);
        });

        client.on('connect', () => {
            req.redis = client;
            next();
        });
    }
};