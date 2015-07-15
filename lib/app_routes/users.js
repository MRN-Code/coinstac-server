const bcrypt = require('bcrypt');
const boom = require('boom');

exports.register = function (server, options, next) {
    const path = '/users';
    const db = server.plugins.pouch.userDb;

    server.route({
        method: 'GET',
        path: path,
        handler: (request, reply) => {
            const db = server.plugins.pouch.userDb;
            db.allDocs({ include_docs: true }) // jshint ignore:line
            .then((docs) => {
                reply(JSON.stringify(docs.rows));
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
                reply(JSON.stringify(doc));
            }).catch((err) => {
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'POST',
        path: path,
        handler: (request, reply) => {
            bcrypt.genSalt(12, function(err, salt) {
                bcrypt.hash(request.payload.password, salt, function(err, hash) {
                    if(err) {
                        reply(boom.wrap(err));
                    }
                    db.post({
                        username: request.payload.username,
                        password: hash,
                        email: request.payload.email,
                        institution: request.payload.institution,
                        name: request.payload.name
                    }).then(function (response) {
                        // handle response
                        reply(response.id);
                    }).catch(function (err) {
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
}
