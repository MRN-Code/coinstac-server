'use strict';

exports.register = function (server, options, next) {
    const path = '/consortia';
    const db = server.plugins.pouch.consortiaDb;
    server.route({
        method: 'GET',
        path: path,
        handler: (request, reply) => {
            db.allDocs({ include_docs: true }) // jshint ignore:line
            .then((docs) => {
                reply(JSON.stringify(docs.rows));
            }).catch((err) => {
                reply(400, err.toString());
            });
        }
    });
    next();
};

exports.register.attributes = {
    name: 'consortia'
};
