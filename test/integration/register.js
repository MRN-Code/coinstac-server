'use strict';

const chai = require('chai');
const server = require('../../');
const path = '/users';
chai.use(require('chai-as-promised'));
chai.should();

describe('Users', () => {
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
