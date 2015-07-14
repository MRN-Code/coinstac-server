'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('config');
const glob = require('glob');
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
    }
});

server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: (request, reply) => {
        const db = server.plugins.pouch.userDb;
        db.get(request.params.id) // jshint ignore:line
        .then((doc) => {
            reply(JSON.stringify(doc));
        }).catch((err) => {
            reply(400, err.toString());
        });
    }
});

/**
* Generate a plugin array, including all route plugins under lib/app_routes
* @return {array}
*/
function setPlugins() {
    const plugins = [
        {
            register: require('./lib/plugins/hapi-pouch.js'),
            options: _.merge(config.get('pouchdb.users'), { namespace: 'userDb'})
        },
        { register: require('inject-then') }
    ];

    // add route plugins
    /*
    var newRoute;
    glob.sync('./lib/app_routes/*.js').forEach (function (file) {
        newRoute = {
            register: require(file),
            options: {}
        };
        plugins.push(newRoute);
    });
    */
    return plugins;
}

server.register(setPlugins(), function(err) {
    if (err) {
        console.log('Error registering plugins', err);
    } else {
        console.log('plugins registered');
        console.log(server.plugins);
        if (!module.parent) {
            server.start(() => {
                console.log('Server running at:', server.info.uri);
            });
        }
    }
});

module.exports = server;
