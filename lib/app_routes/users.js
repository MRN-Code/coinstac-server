
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
                reply(400, err.toString());
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users',
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

    next();
};

exports.register.attributes = {
    name: 'users'
}
