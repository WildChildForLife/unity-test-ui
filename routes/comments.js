// Fetch (for the API)
const fetch = require('node-fetch');
// Dates Handle
const moment = require('moment');

module.exports = (app, apiProtocole, apiBaseUrl, apiPort, apiUrl, datesFormat, parseRequest) => {
    // GET : COMMENTS
    app.get('/comments', (req, res) => {
        fetch(apiUrl + '/comments').then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            // Transform Dates to readable dates
            apiResponse.map((comment) => {
                Object.keys(comment).map((key, index) => {
                    comment['createdAt'] = moment(comment['createdAt']).format(datesFormat);
                });
            });
            res.render('comments', {
                title: 'List Comments :',
                activeItem: 'comments',
                comments: apiResponse,
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });

    // POST : CREATE COMMENT
    app.post('/comments/create', (httpRequest, httpResponse) => {
        let bodyRequest = parseRequest(httpRequest.body);

        fetch(apiUrl + '/comments', {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + httpRequest.session.jwtToken,
            }
        }).then(responseApi => responseApi.json()).then(responseApi => {
            httpRequest.flash('apiResponse', responseApi);
            httpResponse.redirect('/comments/create');
        }).catch((e) => {
            throw new Error(e.message);
        });

    });

    // GET : CREATE COMMENT
    app.get('/comments/create', (req, res) => {
        fetch(apiUrl + '/sessions').then((apiSessionResponse) => apiSessionResponse.json()).then((apiSessionResponse) => {
            fetch(apiUrl + '/players').then((apiPlayersResponse) => apiPlayersResponse.json()).then((apiPlayersResponse) => {
                res.render('comment-create', {
                    title: 'Comment - Create : ',
                    activeItem: 'comments',
                    sessions: apiSessionResponse,
                    players: apiPlayersResponse,
                    apiResponse: req.flash('apiResponse'),
                });
            }).catch((e) => {
                throw new Error(e.message);
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });

    // GET : COMMENT BY ID
    app.get('/comments/:id', (req, res) => {
        fetch(apiUrl + '/comments' + '/' + req.params.id).then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            res.render('comment', {
                title: 'Comments - ' + apiResponse.id + ' :',
                activeItem: 'comments',
                comment: apiResponse,
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });
};
