'use strict';

const PouchDb = require('pouchdb');
const url = require('url');
const _ = require('lodash');
const defaultOptions = {
    namespace: 'default',
    port: 5984,
    hostname: 'localhost',
    protocol: 'http',
    db: 'my-db'
};

const register = function(server, options, next) {
    options = _.merge(defaultOptions, options);
    const dbUrl = url.format({
        protocol: options.protocol,
        hostname: options.hostname,
        port: options.port,
        pathname: options.db
    });
    const db = new PouchDb(dbUrl);
    server.plugins.pouch = server.plugins.pouch || {};

    // throw error if namespace already exists
    if (server.plugins.pouch[options.namespace]) {
        const msg = 'PouchDB namespace `' + options.prefix + '` already exists';
        next(new Error(msg));
    }

    server.plugins.pouch[options.namespace] = db;
    next();

    // TODO: attempt to connect to DB before successfully registering plugin.
    // The code below does not allow plugins to be registered after this one.
    /*
    // attempt to get info from the db
    return db.info()
        .then(() => {
            server.plugins.pouch = server.plugins.pouch || {};
            server.plugins.pouch[options.prefix] = db;
            next();
        }).catch(next);
    */
};

module.exports = register;
module.exports.attributes = {
    name: 'hapi-pouch',
    version: '0.0.1',
    multiple: true
};
