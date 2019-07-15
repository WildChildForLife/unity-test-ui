// Fetch (for the API)
const fetch = require('node-fetch');
// Dates Handle
const moment = require('moment');

module.exports = (app, apiProtocole, apiBaseUrl, apiPort, apiUrl, datesFormat, parseRequest) => {
    // GET : SESSIONS
    app.get('/sessions', (req, res) => {
        fetch(apiUrl + '/sessions').then((apiResponse) => apiResponse.json()).then((apiResponse) => {
            // Transform Dates to readable dates
            apiResponse.map((session) => {
                Object.keys(session).map((key, index) => {
                    session['createdAt'] = moment(session['createdAt']).format(datesFormat);
                });
            });
            res.render('sessions', {
                title: 'List Sessions :',
                activeItem: 'sessions',
                sessions: apiResponse
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });

    // POST : CREATE SESSION
    app.post('/sessions/create', (httpRequest, httpResponse) => {
        let bodyRequest = parseRequest(httpRequest.body);

        fetch(apiUrl + '/sessions', {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + httpRequest.session.jwtToken,
            }
        }).then(responseApi => responseApi.json()).then(responseApi => {
            httpRequest.flash('apiResponse', responseApi);
            httpResponse.redirect('/sessions/create');
        }).catch((e) => {
            throw new Error(e.message);
        });

    });

    // GET : CREATE SESSION
    app.get('/sessions/create', (req, res) => {
        res.render('session-create', {
            title: 'Session - Create : ',
            activeItem: 'sessions',
            apiResponse: req.flash('apiResponse'),
        });
    });


    // GET : SESSION BY ID
    app.get('/sessions/:id', (req, res) => {
        fetch(apiUrl + '/sessions' + '/' + req.params.id).then((apiResponseSession) => apiResponseSession.json()).then((apiResponseSession) => {
            // Convert Session Date
            apiResponseSession.createdAt = moment(apiResponseSession.createdAt).format(datesFormat);

            fetch(apiUrl + '/comments?filter[where][sessionId]=' + apiResponseSession.id).then((apiResponseComments) => apiResponseComments.json()).then((apiResponseComments) => {
                // Transform Dates to readable dates
                apiResponseComments.map((comment) => {
                    Object.keys(comment).map((key, index) => {
                        comment['createdAt'] = moment(comment['createdAt']).format(datesFormat);
                    });
                });
                res.render('session', {
                    title: 'Session - ' + apiResponseSession.id + ' :',
                    activeItem: 'sessions',
                    session: apiResponseSession,
                    comments: apiResponseComments,
                });
            }).catch((e) => {
                throw new Error(e.message);
            });
        }).catch((e) => {
            throw new Error(e.message);
        });
    });
};