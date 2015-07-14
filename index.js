'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('config');
const glob = require('glob');
const _ = require('lodash');

server.connection({port:config.get('server.port')});

/**
* Generate a plugin array, including all route plugins under lib/app_routes
* @return {array}
*/
function setPlugins() {
    const plugins = [
        {
            register: require('./lib/plugins/hapi-pouch.js'),
            options: _.merge(
                config.get('pouchdb.users'),
                { namespace: 'userDb' }
            )
        },
        {
            register: require('./lib/plugins/hapi-pouch.js'),
            options: _.merge(
                config.get('pouchdb.consortia'),
                { namespace: 'consortiaDb' }
            )
        },
        { register: require('inject-then') }
    ];

    // add route plugins
    var newRoute;
    glob.sync('./lib/app_routes/*.js').forEach (function (file) {
        newRoute = {
            register: require(file),
            options: {}
        };
        plugins.push(newRoute);
    });
    return plugins;
}

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
