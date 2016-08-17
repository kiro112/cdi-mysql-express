'use strict';

module.exports = (logger) => {

    if (!logger) {
        throw new Error('Logger is missing');
    }

    if (!logger.warn || !logger.error) {
        throw new Error('Logger is missing warn or error function');
    }

    return (err, req, res, next) => {
        const error = err.message || err.data || err;

        if (!(err instanceof Error)) {
            err = new Error(err);
        }

        logger.error(error);

        if (typeof error === 'object') {
            for (let key in error) {
                if (typeof error[key] !== 'function') {
                    logger.warn(key + ': ' + JSON.stringify(error[key]));
                }
            }
        }

        return res.status(500)
                .error('INV_QUERY', error);
    };

};
