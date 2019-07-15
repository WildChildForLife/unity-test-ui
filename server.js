// Well you know, express
const express = require('express');
// Http Body Parser
const bodyParser = require('body-parser');
// Fetch (for the API)
const fetch = require('node-fetch');
// Dates Handle
const moment = require('moment');
// Logs
const winston = require('winston');
// Cookie Parser
const cookieParser = require('cookie-parser');
// Sessions
const session = require('express-session');
// Flash messages
const flash = require('express-flash');



const app = express();
const sessionStore = new session.MemoryStore;


app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 60000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(flash());

// to support JSON-encoded bodies
// to support URL-encoded bodies
// API params
const apiProtocole = 'http';
const apiBaseUrl = '127.0.0.1';
const apiPort = '3000';
const apiUrl = apiProtocole + '://' + apiBaseUrl + ':' + apiPort;
const apiUnreachableException = 'API Unreachable. Please make sure that the API server is up and running on port 3000.';
const datesFormat = 'YYYY-MM-DD';


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.use((req, res, next) => {
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

// -------------------------------- PLAYERS --------------------------------
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

// POST : PLAYER
app.post('/players/create', (httpRequest, httpResponse) => {
    let bodyRequest = parseRequest(httpRequest.body);

    fetch(apiUrl + '/players', {
        method: 'POST',
        body: JSON.stringify(bodyRequest),
        headers: { 'Content-Type': 'application/json'}
    }).then(responseApi => responseApi.json()).then(responseApi => {
        httpRequest.flash('apiResponse', responseApi);
        httpResponse.redirect('/players/create');
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });

});

// GET : PLAYER
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

// -------------------------------- SESSIONS --------------------------------
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
        throw new Error(apiUnreachableException);
    });
});

// POST : SESSION
app.post('/sessions/create', (httpRequest, httpResponse) => {
    let bodyRequest = parseRequest(httpRequest.body);

    fetch(apiUrl + '/sessions', {
        method: 'POST',
        body: JSON.stringify(bodyRequest),
        headers: { 'Content-Type': 'application/json'}
    }).then(responseApi => responseApi.json()).then(responseApi => {
        httpRequest.flash('apiResponse', responseApi);
        httpResponse.redirect('/sessions/create');
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });

});

// GET : SESSION
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
            throw new Error(apiUnreachableException);
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
    });

});

// -------------------------------- RATINGS --------------------------------
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
        throw new Error(apiUnreachableException);
    });
});

// POST : CREATE RATING
app.post('/ratings/create', (httpRequest, httpResponse) => {
    let bodyRequest = parseRequest(httpRequest.body);

    console.log(bodyRequest);
    fetch(apiUrl + '/ratings', {
        method: 'POST',
        body: JSON.stringify(bodyRequest),
        headers: { 'Content-Type': 'application/json'}
    }).then(responseApi => responseApi.json()).then(responseApi => {
        httpRequest.flash('apiResponse', responseApi);
        httpResponse.redirect('/ratings/create');
    }).catch((e) => {
        throw new Error(apiUnreachableException);
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
            throw new Error(apiUnreachableException);
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
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
        throw new Error(apiUnreachableException);
    });

});

// -------------------------------- COMMENTS --------------------------------
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
        throw new Error(apiUnreachableException);
    });
});

// POST : CREATE COMMENT
app.post('/comments/create', (httpRequest, httpResponse) => {
    let bodyRequest = parseRequest(httpRequest.body);

    fetch(apiUrl + '/comments', {
        method: 'POST',
        body: JSON.stringify(bodyRequest),
        headers: { 'Content-Type': 'application/json'}
    }).then(responseApi => responseApi.json()).then(responseApi => {
        httpRequest.flash('apiResponse', responseApi);
        httpResponse.redirect('/comments/create');
    }).catch((e) => {
        throw new Error(apiUnreachableException);
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
            throw new Error(apiUnreachableException);
        });
    }).catch((e) => {
        throw new Error(apiUnreachableException);
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
        throw new Error(apiUnreachableException);
    });
});

const parseRequest = (bodyRequest) => {
    if (bodyRequest !== null && bodyRequest.constructor.name === "Object" && Object.keys(bodyRequest).length) {
        Object.keys(bodyRequest).forEach((element) => {
            if (element.slice(-2) === 'Id' || element === 'score') {
                bodyRequest[element] = parseInt(bodyRequest[element]);
            }
            if (element === 'createdAt') {
                bodyRequest[element] = moment().toISOString();
            }
        });
    }

    return bodyRequest;
}

