const bcrypt = require('bcrypt');
const boom = require('boom');

exports.register = function (server, options, next) {
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
                console.log(err);
                reply(boom.wrap(err));
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users',
        handler: (request, reply) => {
            const db = server.plugins.pouch.userDb;
            bcrypt.genSalt(12, function(err, salt) {
                bcrypt.hash(request.payload.password, salt, function(err, hash) {
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
                    }).then(function (response) {
                        // handle response
                        reply(response.id);
                    }).catch(function (err) {
                        console.log(err);
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
