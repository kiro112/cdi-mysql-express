'use strict';

const crypto  = require('crypto');
const config  = require(__dirname + '/../config/config');

exports.encrypt = (data, callback) => {
    
    const cipher    = crypto.createCipher(config.ENCRYPT, config.SALT);
    let encrypted   = cipher.update(data, 'utf8', 'hex');
    encrypted      += cipher.final('hex');
    
    callback(encrypted);
};

exports.decrypt = (data, callback) => {

    const decipher = crypto.createDecipher(config.ENCRYPT, config.SALT);
    let decrypted  = decipher.update(data, 'hex', 'utf8');
    decrypted     += decipher.final('utf8');
    decrypted      = JSON.parse(decrypted);

    callback(decrypted);
};

exports.encryptSync = (data) => {

    if (typeof data === 'object' ) {
        data  = JSON.stringify(data);
    } 

    else if (typeof data === 'number') {
        data  = data.toString();
    } 

    else if (typeof data !== 'string') {
        throw new TypeError('Data must be object or number');
    } 

    const cipher    = crypto.createCipher(config.ENCRYPT, config.SALT);
    let encrypted   = cipher.update(data, 'utf8', 'hex');
    encrypted      += cipher.final('hex');
    
    return encrypted;
};

exports.decryptSync = (data) => {

    const decipher = crypto.createDecipher(config.ENCRYPT, config.SALT);
    let decrypted  = decipher.update(data, 'hex', 'utf8');
    decrypted     += decipher.final('utf8');

    try {
        decrypted  = JSON.parse(decrypted);
    } catch (e) {

        try {
            decrypted  = parseInt(decrypted);
        } catch (e) {
            return decrypted;
        }

    }

    return decrypted;
};