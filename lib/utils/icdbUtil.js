'use strict';

const config = require('config'); // jshint ignore:line
const icdbOptions = config.get('pouchdb.icdb');
const PouchW = require('pouchdb-wrapper');
const url = require('url');
const _ = require('lodash');

module.exports = function createIcdb(name) {
    name = _.kebabCase(name.toLowerCase());
    const config = {
        name: 'coinstac-icdb-' + name,
        conn: {
            protocol: icdbOptions.protocol,
            hostname: icdbOptions.hostname,
            port: icdbOptions.port,
            pathname: 'coinstac-icdb-' + name
        }
    };

    // create new db
    let newDb = new PouchW(config);
    return newDb;
};
