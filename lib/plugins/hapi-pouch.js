'use strict';

const PouchDb = require('pouchdb');
const url = require('url');
const _ = require('lodash');
const defaultOptions = {
    prefix: 'default',
    port: 5984,
    hostname: 'localhost',
    protocol: 'http',
    db: 'my-db'
};

const register = (server, options, next) => {
    options = _.merge(defaultOptions, options);
    const dbUrl = url.format({
        protocol: options.protocol,
        hostname: options.host,
        port: options.port,
        pathname: options.db
    });
    const db = new PouchDb(dbUrl);

    // attempt to get info from the db
    db.info()
        .then(() => {
            server.plugins.pouch[options.prefix] = db;
            return next();
        }).catch(next);
};

module.exports = register;
module.exports.attributes = {
    name: 'hapi-pouch',
    version: '0.0.1'
};
