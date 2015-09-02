'use strict';
const icdbUtil = require('../utils/icdbUtil.js');
const config = require('config'); // jshint ignore:line
const boom = require('boom');

const assertIndexes = (db) => {
    return db.createIndex({
        index: {
            fields: ['sha']
        }
    }); // ToDo handle error condition
};

exports.register = (server, options, next) => {
    const path = '/consortia';
    let db = server.plugins.pouch.consortiaDb;
    assertIndexes(db);

    /**
     * responds with list of all consortia and their details
     */
    server.route({
        method: 'GET',
        path: path,
        handler: (request, reply) => {
            db.all()
            .then(reply)
            .catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    /**
     * accepts a consortia id
     * responds with details about a specific consortia
     */
    server.route({
        method: 'GET',
        path: path + '/{id}',
        handler: (request, reply) => {
            db.get(request.params.id, {include_docs: true}) // jshint ignore:line
            .then(reply)
            .catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    /**
     * accepts consortia details
     * adds new consortia to coinstac-consortiadb
     * creates a new consortia db named: coinstac-icdb-<consortiaID>
     * responds with newly created consortia doc
     */
    server.route({
        method: 'POST',
        path: path,
        handler: (request, reply) => {
            db.add({
                label: request.payload.label,
                users: request.payload.users,
                description: request.payload.description,
                tags: request.payload.tags,
                analyses: request.payload.analyses
            }).then((doc) => {
                // create new db
                let newDb = icdbUtil(request.payload.label);
                reply(doc)
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    // @TODO - This is a whoops. PUT should have been against consortia/{id}
    server.route({
        method: 'PUT',
        path: path,
        handler: (request, reply) => {
            if (!request.payload._id) {
                let err = new Error([
                    'no _id provided for consortia',
                    request.payload.label
                ].join(' '));
                return reply(boom.wrap(err));
            }
            db.save(request.payload)
            .then(reply)
            .catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'consortia'
};
