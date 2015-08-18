'use strict';

const chai = require('chai');
const config = require('config'); // jshint ignore:line
const testDb = 'test-coinstac-users';
//config.pouchdb.users.db = testDb;
const path = '/users';
const server = require('../../index.js');
let db;
const _ = require('lodash');

const fakeUsers = require('../../config/demo-data.js').demoData.fakeUsers;

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
function prepareUserDb() {
    this.timeout(5000);
    return server.app.pluginsLoaded
        .then(() => {
            console.log('server ready');
            db = server.plugins.pouch.userDb;
            return fetchAllRows()
                .then(deleteAll)
                .then(_.bind(db.bulkDocs, db, fakeUsers));
        });
}

describe('Users', () => {
    before(prepareUserDb);
    it('Should accept GET request', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then((resp) => {
            resp.statusCode.should.eql(200);
        });
    });

    it('Should respond to GET request with array of users', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then((resp) => {
            const users = resp.result;
            users.length.should.eql(fakeUsers.length);
        });
    });

    it('Should respond to GET request with one user', () => {
        return server.injectThen({
            method: 'GET',
            url: path + '/' + fakeUsers[0]._id
        }).then((resp) => {
            const user = resp.result;
            user.username.should.eql(fakeUsers[0].username);
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
                resp.statusCode.should.eql(200);
            });
        });

        it('Should respond with the added user', () => {
            return server.injectThen({
                method: 'GET',
                url: path + '/' + userId
            }).then((resp) => {
                const user = resp.result;
                user.username.should.eql(newUser.username);
            });
        });
    });
});
