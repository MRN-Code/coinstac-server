'use strict';

const chai = require('chai');
const config = require('config'); // jshint ignore:line
const testDb = 'test-coinstac-users';
config.pouchdb.users.db = testDb;
const path = '/users';
const server = require('../../index.js');
const db = server.plugins.pouch.userDb;
const _ = require('lodash');

const fakeUsers = [
    {
        _id: 'fakeuser-1',
        username: 'user1',
        password: 'hashme',
        email: 'test@test.com',
        institution: 'test',
        name: 'Test Lastname'
    },
    {
        _id: 'fakeuser-2',
        username: 'user2',
        password: 'hashme2',
        email: 'user2@test.com',
        institution: 'test',
        name: 'User Two'
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
        .then(_.bind(db.bulkDocs, db, fakeUsers))
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
            resp.result.should.eql(fakeUsers);
        });
    });

    it('Should accept POST request with proper payload', () => {
        return server.injectThen({
            method: 'POST',
            url: path,
            payload: {
                username: 'test',
                email: 'test@test.com',
                password: '12345',
                name: 'Test User',
                institution: 'testiversity'
            }
        }).then((resp) => {
            resp.statusCode.should.eql(200);
        });
    });
});
