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
            const users = JSON.parse(resp.result);
            users.length.should.eql(fakeUsers.length);
        });
    });

    it('Should respond to GET request with one user', () => {
        return server.injectThen({
            method: 'GET',
            url: path + '/' + fakeUsers[0]._id
        }).then ((resp) => {
            console.log(resp.result);
            const users = JSON.parse(resp.result);
            users.length.should.eql(fakeUsers.length);
        });
    });

    describe('User addition', () => {
        let userId;
        let newUser = {
            username: 'test',
            email: 'test@test.com',
            password: '12345',
            name: 'Test User',
            institution: 'testiversity'
        }
        it('Should accept POST request with proper payload', () => {
            return server.injectThen({
                method: 'POST',
                url: path,
                payload: newUser
            }).then((resp) => {
                userId = resp.result;
                console.log('User ID: ' + resp.result);
                resp.statusCode.should.eql(200);
            });
        });

        it('Should respond with the added user', () => {
            return server.injectThen({
                method: 'GET',
                url: path + '/' + userId
            }).then ((resp) => {
                console.log('Result: ' + resp.result);
                const user = JSON.parse(resp.result);
                user.username.should.eql(newUser.username);
            });
        });
    });
});
