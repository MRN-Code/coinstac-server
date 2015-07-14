'use strict';

const goodOptions = {
    //opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        events:{ log: '*', response: '*' }
    }, {
        reporter: require('good-file'),
        events:{ log: '*', response: '*' },
        config: { path: config.get('logPath'), prefix: 'node', rotate: 'daily' }
    }]
};

const server = new hapi.Server();
const httpsOptions = {
    labels: ['https'],
    port: config.get('httpsPort')
};
const httpOption = {
    labels: ['http'],
    port: config.get('httpPort')
};
if (config.has('sslCertPath')) {
    httpsOptions.tls = require('./lib/utils/sslCredentials.js');
}

var https = server.connection(httpsOptions);
var http = server.connection(httpOption);

process.stderr.on('data', function(data) {
    console.log(data);
});
