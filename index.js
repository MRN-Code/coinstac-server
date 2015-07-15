'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server({
    connections: {
        routes: {
            cors: true
        }
    }
});
const config = require('config');
const glob = require('glob');
const _ = require('lodash');
const data = require('./config/demo-data.js');
const Promise = require('bluebird');

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
                { namespace: 'userDb', plugins: [require('pouchdb-find')] }
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

/**
 * Add promise to be fulfilled when the plugins have loaded
 * This is primarily for use by the tests
 */
server.app.pluginsLoaded = new Promise((res, rej) => {
    server.app.resolvePluginsLoaded = res;
    server.app.rejectPluginsLoaded = rej;
});

server.register(setPlugins(), function(err) {
    if (err) {
        console.log('Error registering plugins', err);
        server.app.rejectPluginsLoaded(err);
    } else {
        server.app.resolvePluginsLoaded();
        console.log('plugins registered');
        if (!module.parent) {
            // We are not being required from another script. This is not a test
            // load demo data
            Promise.all(require('./config/demo-data.js')(server.plugins.pouch))
            .then(() => {
                server.start(() => {
                    console.log('Server running at:', server.info.uri);
                });
            }).catch((err) => {
                console.dir(err);
            });
        }
    }
});

module.exports = server;
