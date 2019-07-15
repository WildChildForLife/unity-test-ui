// Fetch (for the API)
const fetch = require('node-fetch');

module.exports = (app, apiProtocole, apiBaseUrl, apiPort, apiUrl, apiUnreachableException, datesFormat, parseRequest) => {
    // GET : PLAYERS
    app.get('/players', (req, res) => {
        fetch(apiUrl + '/players').then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            res.render('players', {
                title: 'Players :',
                activeItem: 'players',
                players: apiResponse
            });
        }).catch((e) => {
            throw new Error(apiUnreachableException);
        });
    });

    // POST : CREATE PLAYER
    app.post('/players/create', (httpRequest, httpResponse) => {
        let bodyRequest = parseRequest(httpRequest.body);

        fetch(apiUrl + '/players', {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
            headers: {'Content-Type': 'application/json'}
        }).then(responseApi => responseApi.json()).then(responseApi => {
            httpRequest.flash('apiResponse', responseApi);
            httpResponse.redirect('/players/create');
        }).catch((e) => {
            throw new Error(apiUnreachableException);
        });

    });

    // GET : CREATE PLAYER
    app.get('/players/create', (req, res) => {
        fetch(apiUrl + '/sessions').then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            res.render('player-create', {
                title: 'Player - Create : ',
                activeItem: 'players',
                sessions: apiResponse,
                apiResponse: req.flash('apiResponse'),
            });
        }).catch((e) => {
            throw new Error(apiUnreachableException);
        });
    });

    // GET : PLAYER BY ID
    app.get('/players/:id', (req, res) => {
        fetch(apiUrl + '/players' + '/' + req.params.id).then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            res.render('player', {
                title: 'Player - ' + apiResponse.id + ' :',
                activeItem: 'players',
                player: apiResponse
            });
        }).catch((e) => {
            throw new Error(apiUnreachableException);
        });
    });
};