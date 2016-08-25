'use strict';

module.exports = (roles) => {

    return (req, res, next) => {
        let index,
        let user_role   = req.body.user.role;

        if (typeof roles === 'string' && user_role === roles) {
            return next();
        }

        if (Array.isArray(roles)) {

            index = roles.indexOf(user_role);

            if (index !== -1) {
                return next();
            } else {
                res.error('UNAUTH', 'Unauthorized role')
            }

        } else {
            throw new TypeError('Roles must be string or array');
        }

    };
    
};