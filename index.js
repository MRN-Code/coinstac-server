'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
var config = require('config');

server.connection({port:config.get('server.port')});

server.route({
    method: 'GET',
    path: '/users',
    handler: (request, reply) => {
        const users = [
            {
                id: 1,
                username: 'test',
                email: 'test@test.com',
                password: 'md5hash',
                name: 'Test Name',
                institution: 'testitution'
            }
        ];
        reply(JSON.stringify(users));
    }
});

server.register(
    [
        {
            register: require('hapi-couchdb').register,
            options: {
                url: 'http://username:password@localhost:5984',
                db: 'mycouchdb'
            }
        },
        { register: require('inject-then') }
    ], function(err) {
        if (err) {
            console.log('Error registering hapi-couchdb', err);
        } else {
            console.log('hapi-couchdb registered');
            if (!module.parent) {
                server.start(() => {
                    console.log('Server running at:', server.info.uri);
                });
            }
        }
    }

);

module.exports = server;
