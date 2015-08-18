'use strict';

const PouchW = require('pouchdb-wrapper');
const url = require('url');
const _ = require('lodash');
const defaultOptions = {
    namespace: 'default',
    port: 5984,
    hostname: 'localhost',
    protocol: 'http',
    db: 'my-db',
    plugins: []
};

const register = function(server, options, next) {
    options = _.merge(defaultOptions, options);

    // register PouchDB plugins
    // this appears to be safe to do repeatedly, every time this function is called
    _.forEach(options.plugins, (plugin) => {
        PouchW.PouchDB.plugin(plugin);
    });

    const config = {
        name: options.db,
        conn: {
            protocol: options.protocol,
            hostname: options.hostname,
            port: options.port,
            pathname: options.db
        }
    };
    const db = new PouchW(config);

    server.plugins.pouch = server.plugins.pouch || {};

    // throw error if namespace already exists
    if (server.plugins.pouch[options.namespace]) {
        const msg = 'PouchDB namespace `' + options.prefix + '` already exists';
        next(new Error(msg));
    }

    // attempt to get info from the db
    return db.info()
        .then(() => {
            server.plugins.pouch[options.namespace] = db;
            next();
        }).catch(next);
};

module.exports = register;
module.exports.attributes = {
    name: 'hapi-pouch',
    version: '1.0.0',
    multiple: true
};
