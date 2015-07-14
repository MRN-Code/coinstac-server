'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('config');
const plugins = [
    {
        register: require('./lib/plugins/hapi-pouch.js'),
        options: {
            db: 'coinstac-users',
            prefix: 'userDb'
        }
    },
    { register: require('inject-then') }
];

server.connection({port:config.get('server.port')});

server.route({
    method: 'GET',
    path: '/users',
    handler: (request, reply) => {
        server.methods.userDb.list((err, all) => {
            console.log(err);
            console.log(all);
            reply(JSON.stringify(all));
        });
        /*
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
        */
    }
});

server.register(plugins, function(err) {
        if (err) {
            console.log('Error registering plugins', err);
        } else {
            console.log('plugins registered');
            if (!module.parent) {
                server.start(() => {
                    console.log('Server running at:', server.info.uri);
                });
            }
        }
    }

);

module.exports = server;
