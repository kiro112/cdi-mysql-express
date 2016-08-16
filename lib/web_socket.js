'use strict';

const url      = require('url');
const config   = require(__dirname + '/../config/config');
const winston  = require('winston');

module.exports = (wss) => {

    wss.on('connection', (ws) => {
        
        let location = url.parse(ws.upgradeReq.url, true);

        ws.on('message', (message) => {
            message = JSON.parse(message);

            if (message.join) {

            }

            if (message.logout) {
                ws.close();
            }

            winston.info('received: %s', JSON.stringify(message, 2, null));
        });


        ws.send('User Connected');
    });

};