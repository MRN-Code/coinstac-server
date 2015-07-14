'use strict';

//var should = require('should');
var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

describe('hello world exists', () => {
    const server = require('../test.js');
    let resp;
    beforeEach('send request', () => {
        resp = server.injectThen({
            method: 'GET',
            url: '/'
        });
    });

    it('should return hello world text', () => {
        return resp.then(
            (resp) => {
                resp.result.should.eql('Hello, world!');
            }

        );
    });

    it('should return with 200 response code', () => {
        return resp.then(
            (resp) => {
                resp.statusCode.should.eql(200);
            }

        );
    });
});

describe('Array', () => {
    describe('#indexOf()', () => {
        var testArray;
        beforeEach('prepare test array', () => {
            testArray = [1, 2, 3];
        });

        it('should return the index when the value is present', () => {
            testArray.indexOf(1).should.eql(0);
            testArray.indexOf(2).should.eql(1);
            testArray.indexOf(3).should.eql(2);
        });

        it('should return -1 when the value is not present', () => {
            testArray.indexOf(5).should.eql(-1);
            testArray.indexOf(0).should.eql(-1);
        });

        it('silly async test', (done) => {
            process.nextTick(() => {
                //this is async
                done();
            });
        });
    });
});
