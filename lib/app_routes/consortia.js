'use strict';
const boom = require('boom');

exports.register = (server, options, next) => {
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
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'GET',
        path: path + '/{id}',
        handler: (request, reply) => {
            db.get(request.params.id)
            .then((doc) => {
                reply(JSON.stringify(doc));
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'POST',
        path: path,
        handler: (request, reply) => {
            db.post({
                label: request.payload.label,
                users: request.payload.users,
                description: request.payload.description,
                tags: request.payload.tags
            }).then((response) => {
                // handle response
                reply(response.id);
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'consortia'
}
