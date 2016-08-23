'use strict';

const crypto  = require('crypto');
const config  = require(__dirname + '/../config/config');

exports.encrypt = function (password, callback) {
    const cipher    = crypto.createCipher(config.ENCRYPT, config.SALT);
    let encrypted   = cipher.update(password, 'utf8', 'hex');
    encrypted      += cipher.final('hex');
    callback(encrypted);
};

exports.decrypt = function (password, callback) {
    const decipher = crypto.createDecipher(config.ENCRYPT, config.SALT);
    let decrypted  = decipher.update(password, 'hex', 'utf8');
    decrypted     += decipher.final('utf8');
    callback(decrypted);
};