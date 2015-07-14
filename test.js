'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();

server.connection({port:3000});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        reply('Hello, world!');
    }
});

server.register(
    {register: require('inject-then')},
    (err) => {
        if (err) {
            throw err;
        }

        if (!module.parent) {
            server.start(() => {
                console.log('Server running at:', server.info.uri);
            });
        }
    }

);

module.exports = server;
