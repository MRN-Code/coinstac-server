'use strict';

const chai = require('chai');
let config = require('config'); // jshint ignore:line
const testDb = 'test-coinstac-consortia';
//config.pouchdb.users.db = testDb;
const path = '/consortia';
const server = require('../../index.js');
const _ = require('lodash');
const PouchDB = require('pouchdb');
const url = require('url');
const icdbOptions = config.get('pouchdb.icdb');
let db;

const fakeData = require('../../config/demo-data.js').demoData.fakeData;

chai.use(require('chai-as-promised'));
chai.should();

/**
 * Fetch all rows
 * @return {promise} resolves to all rows
 */
function fetchAllRows() {
    return db.allDocs({ include_docs: true }) // jshint ignore:line
        .then((docs) => {
            return docs.rows;
        });
}

/**
 * Delete all rows, provided db rows with documents
 * @param  {Row} rows
 * @return {promise} resolves to bulk action result report set
 */
function deleteAll(rows) {
    let docs = rows.map((row) => {
        row.doc._deleted = true;
        return row.doc;
    });

    return db.bulkDocs(docs);
}

/**
 * prepare user DB with dummy data
 * @return {Promise}
 */
function prepareConsortiaDb(done) {
    this.timeout(5000)
    return server.app.pluginsLoaded
        .then(() => {
            db = server.plugins.pouch.consortiaDb;
            return fetchAllRows()
            .then(deleteAll)
            .then(_.bind(db.bulkDocs, db, fakeData))
            .then(() => { return done(); })
        })
        .catch(done);
}

describe('Consortia', () => {
    before(prepareConsortiaDb);

    it('Should accept GET request', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then((resp) => {
            resp.statusCode.should.eql(200);
        });
    });

    it('Should respond to GET request with array of consortia', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then((resp) => {
            const consortia = resp.result;
            consortia.length.should.eql(fakeData.length);
        });
    });

    it('Should respond to GET request with one consortia', () => {
        return server.injectThen({
            method: 'GET',
            url: path + '/' + fakeData[0]._id
        }).then((resp) => {
            const consortia = resp.result;
            consortia.label.should.eql(fakeData[0].label);
        });
    });

    describe('Consortia addition', () => {
        let consortiaId;
        let consortia;
        let newConsortia = {
            label: 'consortia test label',
            users: [
                {id: 'testUser-1'},
                {id: 'testUser-2'}
            ],
            description: 'test description ...',
            tags: [
                {id: 'testTag-1'},
                {id: 'testTag-2'}
            ]
        }

        it('Should accept POST request with proper payload', () => {
            return server.injectThen({
                method: 'POST',
                url: path,
                payload: newConsortia
            }).then((resp) => {
                consortiaId = resp.result;
                resp.statusCode.should.eql(200);
            });
        });

        it('Should verify that a new db was created', () => {
            // define new db parameters
            const icdbUrl = url.format({
                protocol: icdbOptions.protocol,
                hostname: icdbOptions.hostname,
                port: icdbOptions.port,
                pathname: 'coinstac-icdb-' + consortiaId.toLowerCase()
            });

            // create new db
            const newDb = new PouchDB(icdbUrl, {skipSetup: true});

            return newDb.info();
        });

        it('Should respond with the added consortia', () => {
            return server.injectThen({
                method: 'GET',
                url: path + '/' + consortiaId
            }).then((resp) => {
                consortia = resp.result;
                consortia.label.should.eql(newConsortia.label);
            });
        });

        it('Should accept PUT request with added user', () => {
            consortia.users.push({id: 'newTestUser'});

            return server.injectThen({
                method: 'PUT',
                url: path,
                payload: consortia
            }).then((resp) => {
                const response = resp.result;
                response.should.have.property('rev');
            });
        });
    });
});
