'use strict';

const config = require('config'); // jshint ignore:line
const icdbOptions = config.get('pouchdb.icdb');
const PouchDB = require('pouchdb');
const url = require('url');

module.exports = function createIcdb(id) {
    const icdbUrl = url.format({
        protocol: icdbOptions.protocol,
        hostname: icdbOptions.hostname,
        port: icdbOptions.port,
        pathname: 'coinstac-icdb-' + id.toLowerCase()
    });

    // create new db
    let newDb = new PouchDB(icdbUrl); //TODO: can add db options here

    newDb.on('complete', function(){
        console.log('The db has changed');
    });
    return newDb;
};
