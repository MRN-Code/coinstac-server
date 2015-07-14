'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('config');
const glob = require('glob')
const _ = require('lodash');

server.connection({port:config.get('server.port')});

server.route({
    method: 'GET',
    path: '/users',
    handler: (request, reply) => {
        const db = server.plugins.pouch.userDb;
        db.allDocs({ include_docs: true }) // jshint ignore:line
        .then((docs) => {
            reply(JSON.stringify(docs.rows));
        }).catch((err) => {
            reply(200, err.toString());
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
server.route({
    method: 'GET',
    path: '/users',
    handler: (request, reply) => {
        const db = server.plugins.pouch.userDb;
        db.allDocs({ include_docs: true }) // jshint ignore:line
        .then((docs) => {
            reply(JSON.stringify(docs.rows));
        }).catch((err) => {
            reply(200, err.toString());
        });
        */
    }
});

server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: (request, reply) => {

    }


})

/**
* Generate a plugin array, including all route plugins under lib/app_routes
* @return {array}
*/
setPlugins = function () {
    const plugins = [
        {
            register: require('./lib/plugins/hapi-pouch.js'),
            options: config.get('pouchdb.users')
        },
        { register: require('inject-then') }
    ];

    // add route plugins
    var newRoute;
    glob.sync('./lib/app_routes/*.js').forEach (function (file) {
        newRoute = {
            register: require(file),
            options: {
                redisClient: client,
                relations: server.plugins.hapi_relations
            }
        };
        plugins.push(newRoute);
    });
    return plugins;
};

server.register(setPlugins(), function(err) {
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
});

module.exports = server;
