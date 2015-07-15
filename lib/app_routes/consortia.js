'use strict';
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
                // define new db parameters
                const icdbUrl = url.format({
                    protocol: icdbOptions.protocol,
                    hostname: icdbOptions.hostname,
                    port: icdbOptions.port,
                    pathname: 'coinstac-icdb-' + response.id.toLowerCase()
                });

                // create new db
                const newDb = new PouchDB(icdbUrl); //TODO: can add db options here

                newDb.info()
                    .then(() => {
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

    next();
};

exports.register.attributes = {
    name: 'consortia'
};
