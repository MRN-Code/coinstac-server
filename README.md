# COINSTAC Server
Server-side services for the
Collaborative Informatics and Neuroimaging Suite To Aide Consortia
// TODO: update acronym definition

# Requirements
1. CouchDB
2. NodeJS (v12)

# Usage
1. `git clone git@github.com:MRN-Code/coinstac-server; cd coinstac-server;`
1. `npm i`
1. `npm start` This will start CouchDB as a background process
on the standard port, then start the Node server in the foreground.

Note: to stop the CouchDB daemon, run `npm stop`

# Tests
`npm test`

# API
## Routes
### GET /users/
Retrieve a list of all registered users.

### GET /users/{id}
Retrieve a specific users' info.

### POST /users
Add/register a new user. Returns the id and rev of the user.
// TODO: Also log the user in, and return their API key
// TODO: Implement email verification

### GET /consortia
Retrieve a list of all consortia

### GET /consortia/{id}
Retrieve a specific consortium's info.

### POST /consortia
Add a new consortium. Returns the id and rev of the new consortium.
The payload should be an object with the following properties
```json
{
    label: {string},
    description: {string},
    users: {array},
    tags: {array}
}
```

### PUT /consortia/{id}
Update an existing consortium.
The payload should have the same properties as that for `POST /consortia`, in
addition to `_id` and `_rev`.

### GET /auth/login (not finished)
Attempt to login with a username and password.
Username and password should be passed in the headers in the following form:
`Authorization: 'Basic ' + (new Buffer('uname:pwd')).toString('base64')`
If successful will return a HAWK key pair for use in signing future requests.

### GET /auth/logout (not finished)
Logout.
This will invalidate the HAWK key pair used to make this request.
It is up to the client to discard the HAWK key pair on its end.

## development
- helpful `couchdb` utilities may be found in `couch-util.js`.  For example:
    - `node couch-util.js --dd` deletes all couchdb databases on your server. tread with caution! :)

# TODO
[] Implement ath routes and protect actions that should require login
[] Add routes for tags
[] Add validation to payloads received
[] Add persistent tracking of server-side analyses to be performed per consortium.
[] Migrate hapi-pouch.js to full-on plugins

## Contributing
Please submit any changes to this repo (including additions and subtractions from the lint config files) as pull requests.
