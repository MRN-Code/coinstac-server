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
            _id: 'consortium-1',
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
            _id: 'consortium-2',
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
        },
        {
            _id: 'consortium-3',
            label: 'Sample Consortia 3',
            users: [
                {
                    id: 'fakeuser-1'
                },
                {
                    id: 'fakeuser-4'
                }
            ],
            description: 'Proin nec tincidunt ligula, eget mollis eros. Vestibulum varius, nibh vel pulvinar venenatis, sem sem cursus lacus, at pellentesque elit leo at augue. Quisque eget ex sed libero euismod dapibus.',
            tags: [
                {
                    id: 'faketag-1'
                },
                {
                    id: 'faketag-2'
                }
            ]
        },
        {
            _id: 'consortium-4',
            label: 'Sample Consortia 4',
            users: [
                {
                    id: 'fakeuser-2'
                }
            ],
            description: 'Sed ullamcorper erat ligula. Aenean sodales lorem sit amet neque pulvinar, nec facilisis mi maximus. Vestibulum ante mauris, porttitor id pellentesque vel, imperdiet lacinia erat. Nunc pellentesque neque dui, id ornare lacus ornare eu.',
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
function loadDemoData(pouch) {
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

module.exports = {
    demoData: demoData,
    loadDemoData: loadDemoData
};
