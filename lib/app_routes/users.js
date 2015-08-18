'use strict';

const bcrypt = require('bcrypt');
const boom = require('boom');
const atob = require('atob');

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
    const path = '/users';

    server.route({
        method: 'GET',
        path: path,
        handler: (request, reply) => {
            db.allDocs({ include_docs: true }) // jshint ignore:line
            .then((docs) => {
                reply(docs.rows);
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'GET',
        path: path + '/{id}',
        handler: (request, reply) => {
            db.get(request.params.id)
            .then((doc) => {
                reply(doc);
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'POST',
        path: path,
        handler: (request, reply) => {
            if (request.payload.encoded) {
                request.payload = JSON.parse(atob(request.payload.encoded));
            }
            const rawPwd = request.payload.password;
            bcrypt.genSalt(12, function(err, salt) {
                bcrypt.hash(rawPwd, salt, function(err, hash) {
                    if(err) {
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
