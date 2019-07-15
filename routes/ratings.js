// Fetch (for the API)
const fetch = require('node-fetch');

module.exports = (app, apiProtocole, apiBaseUrl, apiPort, apiUrl, datesFormat, parseRequest) => {
    // GET : RATINGS
    app.get('/ratings', (req, res) => {
        fetch(apiUrl + '/ratings').then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            if (req.query.sessionId !== undefined) {
                const filtered = apiResponse.find(r => r.sessionId == req.query.sessionId);
                apiResponse = (filtered !== undefined) ? [filtered] : apiResponse;

            }
            res.render('ratings', {
                title: 'List Ratings :',
                activeItem: 'ratings',
                ratings: apiResponse,
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });

    // POST : CREATE RATING
    app.post('/ratings/create', (httpRequest, httpResponse) => {
        let bodyRequest = parseRequest(httpRequest.body);

        fetch(apiUrl + '/ratings', {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + httpRequest.session.jwtToken,
            }
        }).then(responseApi => responseApi.json()).then(responseApi => {
            httpRequest.flash('apiResponse', responseApi);
            httpResponse.redirect('/ratings/create');
        }).catch((e) => {
            throw new Error(e.message);
        });

    });

    // GET : CREATE RATING
    app.get('/ratings/create', (req, res) => {
        fetch(apiUrl + '/sessions').then((apiSessionResponse) => apiSessionResponse.json()).then((apiSessionResponse) => {
            fetch(apiUrl + '/players').then((apiPlayersResponse) => apiPlayersResponse.json()).then((apiPlayersResponse) => {
                res.render('rating-create', {
                    title: 'Rating - Create : ',
                    activeItem: 'ratings',
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

    // GET : RATING BY ID
    app.get('/ratings/:id', (req, res) => {
        fetch(apiUrl + '/ratings' + '/' + req.params.id).then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            res.render('ratings', {
                title: 'Ratings - ' + apiResponse.id + ' :',
                activeItem: 'ratings',
                ratings: apiResponse,
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });
}