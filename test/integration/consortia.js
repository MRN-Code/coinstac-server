'use strict';

const chai = require('chai');
const config = require('config'); // jshint ignore:line
const testDb = 'test-coinstac-consortia';
config.pouchdb.users.db = testDb;
const path = '/consortia';
const server = require('../../index.js');
const db = server.plugins.pouch.consortiaDb;
const _ = require('lodash');

const fakeData = [
    {
        _id: 'fakeData-1',
        label: 'consortia1',
        users: [
            {
                id: 'fakeuser-1'
            }
        ],
        description: 'test description ...',
        tags: [
            {
                id: 'faketag-1'
            }
        ]
    },
    {
        _id: 'fakeData-2',
        label: 'consortia2',
        users: [
            {
                id: 'fakeuser-2'
            }
        ],
        description: 'test description ...',
        tags: [
            {
                id: 'faketag-2'
            }
        ]
    }
];

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
function prepareUserDb(done) {
    return fetchAllRows()
        .then(deleteAll)
        .then(_.bind(db.bulkDocs, db, fakeData))
        .then(() => { return done(); })
        .catch(done);
}

describe('Users', () => {
    beforeEach(prepareUserDb);
    it('Should accept GET request', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then ((resp) => {
            resp.statusCode.should.eql(200);
        });
    });

    it('Should respond to GET request with array of users', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then ((resp) => {
            const consortia = JSON.parse(resp.result);
            consortia.length.should.eql(fakeData.length);
        });
    });
});
