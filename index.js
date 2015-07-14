'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('config');
const _ = require('lodash');
const plugins = [
    {
        register: require('./lib/plugins/hapi-pouch.js'),
        options: _.merge(config.get('pouchdb.users'), { namespace: 'userDb' })
    },
    { register: require('inject-then') }
];

server.connection({port:config.get('server.port')});

server.route({
    method: 'GET',
    path: '/users',
    handler: (request, reply) => {
        const db = server.plugins.pouch.userDb;
        db.allDocs({ include_docs: true }) // jshint ignore:line
        .then((docs) => {
            reply(JSON.stringify(docs.rows));
        })
        .catch
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
