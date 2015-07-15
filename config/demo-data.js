const demoData = {
    fakeUsers: [
        {
            _id: 'fakeuser-1',
            username: 'user1',
            password: 'hashme',
            email: 'user@test.com',
            institution: 'institution one',
            name: 'User One'
        },
        {
            _id: 'fakeuser-2',
            username: 'user2',
            password: 'hashme2',
            email: 'user2@test.com',
            institution: 'institution two',
            name: 'User Two'
        },
        {
            _id: 'fakeuser-3',
            username: 'user3',
            password: 'hashme3',
            email: 'user3@test.com',
            institution: 'institution three',
            name: 'User Three'
        },
        {
            _id: 'fakeuser-4',
            username: 'user4',
            password: 'hashme4',
            email: 'user4@test.com',
            institution: 'institution four',
            name: 'User Four'
        }
    ],
    fakeData: [
        {
            _id: 'fakeData-1',
            label: 'consortia1',
            users: [
                {
                    id: 'fakeuser-1'
                },
                {
                    id: 'fakeuser-3'
                }
            ],
            description: 'test description ...',
            tags: [
                {
                    id: 'faketag-1'
                }
            ]
        },
        {
            _id: 'fakeData-2',
            label: 'consortia2',
            users: [
                {
                    id: 'fakeuser-2'
                },
                {
                    id: 'fakeuser-4'
                },
                {
                    id: 'fakeuser-1'
                }
            ],
            description: 'test description ...',
            tags: [
                {
                    id: 'faketag-2'
                }
            ]
        }
    ]
};

/**
* prepare user DB with dummy data
* @return {Promise}
*/
module.exports = function (pouch) {
    const promiseArray = [];
    promiseArray.push(
        pouch.userDb.allDocs({ include_docs: true }) // jshint ignore:line
        .then((docs) => {
            return docs.rows;
        })
        .then( (rows) => { if (rows) { pouch.userDb.bulkDocs(demoData.fakeUsers); }})
    );
    promiseArray.push(
        pouch.consortiaDb.allDocs({ include_docs: true }) // jshint ignore:line
        .then((docs) => {
            return docs.rows;
        })
        .then( (rows) => { if (rows) { pouch.consortiaDb.bulkDocs(demoData.fakeData); }})
    );

    return promiseArray;
};
