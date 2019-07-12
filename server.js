const express = require('express');
const fetch = require('node-fetch');
const moment = require('moment');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

// API params
const apiProtocole = 'http';
const apiBaseUrl = '127.0.0.1';
const apiPort = '3000';
const apiUrl = apiProtocole + '://' + apiBaseUrl + ':' + apiPort;
const apiUnreachableException = 'API Unreachable. Please make sure that the API server is up and running on port 3000.';
const datesFormat = 'YYYY-MM-DD';

const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

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
        throw new Error(apiUnreachableException);
    });
});

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
            throw new Error(apiUnreachableException);
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });

});

app.get('/ratings', (req, res) => {
    //const person = people.profiles.find(p => p.id === req.query.id);
    fetch(apiUrl + '/ratings').then((apiResponse) => apiResponse.json()).then((apiResponse) => {
        console.log(apiResponse);
        if (req.query.sessionId !== undefined) {
            const filtered = apiResponse.find(r => r.sessionId == req.query.sessionId);
            if (filtered !== undefined) {

            }
            apiResponse = (filtered !== undefined) ? [filtered] : apiResponse;
        }

        console.log(apiResponse);

        res.render('ratings', {
            title: 'List Ratings :',
            activeItem: 'ratings',
            ratings: apiResponse,
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });
});

app.get('/ratings/:id', (req, res) => {
    fetch(apiUrl + '/ratings' + '/' + req.params.id).then((apiResponse) => apiResponse.json()).then((apiResponse) => {
        res.render('ratings', {
            title: 'Ratings - ' + apiResponse.id + ' :',
            activeItem: 'ratings',
            ratings: apiResponse,
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });

});

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
        throw new Error(apiUnreachableException);
    });
});

app.get('/comments/:id', (req, res) => {
    fetch(apiUrl + '/comments' + '/' + req.params.id).then((apiResponse) => apiResponse.json()).then((apiResponse) => {
        res.render('comment', {
            title: 'Comments - ' + apiResponse.id + ' :',
            activeItem: 'comments',
            comment: apiResponse,
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });

});