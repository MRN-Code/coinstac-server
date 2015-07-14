'use strict';

const chai = require('chai');
const config = require('config'); // jshint ignore:line
const Pouch = require('pouchdb');
const randomstring = require('randomstring');
const testDb = 'test-register';
// config.pouchdb.users.db = testDb; // ENABLE!
const path = '/' + testDb;
const server = require('../../index.js');
// let db = server.plugin.pouch.users;
let db = new Pouch('http://localhost:5984' + testDb);
chai.use(require('chai-as-promised'));
chai.should();

/**
 * Fetch all rows
 * @return {promise} resolves to all rows
 */
let allRows = () => {
    return db.allDocs({include_docs: true}) // jshint ignore:line
        .then(function (docs) {
            return docs.rows;
        });
};

/**
 * Delete all rows, provided db rows with documents
 * @param  {Row} rows
 * @return {promise} resolves to bulk action result report set
 */
let deleteAll = (rows) => {
    let docs = rows.map((row) => {
        row.doc._deleted = true;
        return row.doc;
    });
    return db.bulkDocs(docs);
};

describe('Users', () => {
    beforeEach((done) => {
        let ready = () => {
            done();
        };
        if (db) {
            db.put({
                _id: 'test' + randomstring.generate(25),
                title: +Date()
            })
            .then(allRows)
            .then(deleteAll)
            .then(ready)
            .catch((error) => { console.log(error.message); });
        } else {
            return ready();
        }
    });

    it('Should accept GET request', () => {
        return server.injectThen({
            method: 'GET',
            url: path
        }).then ((resp) => {
            resp.statusCode.should.eql(200);
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
