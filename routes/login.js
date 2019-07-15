// Fetch (for the API)
const fetch = require('node-fetch');
// Dates Handle
const moment = require('moment');
// JWT Token Decode
const jwtDecode = require('jwt-decode');


module.exports = (app, apiProtocole, apiBaseUrl, apiPort, apiUrl, datesFormat, parseRequest) => {
    app.use((req, res, next) => {
        res.locals.username = (req.session.authenticatedUser !== undefined) ? req.session.authenticatedUser : null;
        console.log('checkAuth ' + req.url);

        if (req.url !== '/login' && req.url !== '/logout' && (!req.session.authenticated || jwtDecode(req.session.jwtToken) === undefined)) {
            res.redirect('/login');

            return;
        }

        next();
    });

    // POST : CREATE COMMENT
    app.post('/login', (httpRequest, httpResponse) => {
        let bodyRequest = parseRequest(httpRequest.body);
        fetch(apiUrl + '/users/login', {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
            headers: {'Content-Type': 'application/json'},
        }).then(responseApi => responseApi.json()).then(responseApi => {
            if (responseApi.token !== undefined) {
                let decodedToken = jwtDecode(responseApi.token);

                httpRequest.session.authenticated = true;
                httpRequest.session.jwtToken = responseApi.token;
                httpRequest.session.authenticatedUser = decodedToken.name;
                httpResponse.redirect('/players');

            } else {
                httpRequest.flash('apiResponse', 'Authentication Failed');
                httpResponse.redirect('/login');

                return;
            }
        }).catch((e) => {
            throw new Error(e.message);
        });
    });

    // GET : CREATE COMMENT
    app.get('/login', (req, res) => {
        res.render('login', {
            title: 'Login :',
            activeItem: 'login',
            action: '/login',
            apiResponse: req.flash('apiResponse'),
        });
    });

    // GET : CREATE COMMENT
    app.get('/logout', (req, res) => {
        delete req.session.authenticated;
        delete req.session.jwtToken;
        req.session.authenticatedUser = false;

        res.redirect('/login');
    });
};
