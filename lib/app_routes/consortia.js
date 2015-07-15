'use strict';
const icdbUtil = require('../utils/icdbUtil.js');
const config = require('config'); // jshint ignore:line
const icdbOptions = config.get('pouchdb.icdb');
const boom = require('boom');
const PouchDB = require('pouchdb');
const url = require('url');

exports.register = (server, options, next) => {
    const path = '/consortia';
    const db = server.plugins.pouch.consortiaDb;

    /**
     * responds with list of all consortia and their details
     */
    server.route({
        method: 'GET',
        path: path,
        handler: (request, reply) => {
            db.allDocs({ include_docs: true }) // jshint ignore:line
            .then((docs) => {
                reply(docs.rows);
            }).catch((err) => {
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
            db.get(request.params.id)
            .then((doc) => {
                reply(doc);
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    /**
     * accepts consortia details
     * adds new consortia to coinstac-consortiadb
     * creates a new consortia db named: coinstac-icdb-<consortiaID>
     * responds with id of newly created consortia
     */
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
                // create new db
                //let newDb = createIcdb(response.id);
                let newDb = icdbUtil(response.id);

                newDb.info()
                    .then((info) => {
                        // respond with db id
                        reply(response.id);
                    })
                    .catch((err) => {
                        reply(boom.wrap(err));
                    });

            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'PUT',
        path: path,
        handler: (request, reply) => {
            db.put({
                _id: request.payload._id,
                _rev: request.payload._rev,
                label: request.payload.label,
                users: request.payload.users,
                description: request.payload.description,
                tags: request.payload.tags
            }).then((response) => {
                // handle response
                reply(response);
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'consortia'
};
