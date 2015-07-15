'use strict';

const bcrypt = require('bcrypt');
const boom = require('boom');

function initDb(db) {
    db.createIndex({
        fields: ['username']
    });
    db.createIndex({
        fields: ['email']
    });
    return db;
}

exports.register = function(server, options, next) {
    const db = initDb(server.plugins.pouch.userDb);
    console.log(server.plugins.pouch);
    server.route({
        method: 'GET',
        path: '/users',
        handler: (request, reply) => {
            db.allDocs({ include_docs: true }) // jshint ignore:line
            .then((docs) => {
                reply(docs.rows);
            }).catch((err) => {
                reply(200, err.toString());
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: (request, reply) => {
            db.get(request.params.id) // jshint ignore:line
            .then((doc) => {
                reply(JSON.stringify(doc));
            }).catch((err) => {
                console.log(err);
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users',
        handler: (request, reply) => {
            const rawPwd = request.payload.password;
            bcrypt.genSalt(12, function(err, salt) {
                bcrypt.hash(rawPwd, salt, function(err, hash) {
                    if(err) {
                        console.log(err);
                        reply(boom.wrap(err));
                    }
                    db.post({
                        username: request.payload.username,
                        password: hash,
                        email: request.payload.email,
                        institution: request.payload.institution,
                        name: request.payload.name
                    }).then(function(response) {
                        // handle response
                        reply(response.id);
                    }).catch(function(err) {
                        reply(boom.wrap(err));
                    });
                });
            });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'users'
};
