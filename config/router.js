'use strict';

const importer = require('anytv-node-importer');

module.exports = (router) => {
    const __   = importer.dirloadSync(__dirname + '/../controllers');

    router.del = router.delete;

    router.post ('/users',                            __.user.register);
    router.get  ('/users/:id',                        __.user.get_user);
    router.put  ('/users/:id',                        __.user.update);
    router.del  ('/users/:id',                        __.user.delete);

    router.all('*', (req, res) => {
        res.status(404)
           .send(message: 'Nothing to do here.');
    });

    return router;
};