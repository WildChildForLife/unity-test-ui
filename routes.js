// Dates Handle
const moment = require('moment');

module.exports = (app) => {
    // API params
    const apiProtocole = 'http';
    const apiBaseUrl = '127.0.0.1';
    const apiPort = '3000';
    const apiUrl = apiProtocole + '://' + apiBaseUrl + ':' + apiPort;
    const apiUnreachableException = 'API Unreachable. Please make sure that the API server is up and running on port 3000.';
    const datesFormat = 'YYYY-MM-DD';
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
    };

    const players = require("./routes/players")(app, apiProtocole, apiBaseUrl, apiPort, apiUrl, apiUnreachableException, datesFormat, parseRequest);
    const sessions = require("./routes/sessions")(app, apiProtocole, apiBaseUrl, apiPort, apiUrl, apiUnreachableException, datesFormat, parseRequest);
    const comments = require("./routes/comments")(app, apiProtocole, apiBaseUrl, apiPort, apiUrl, apiUnreachableException, datesFormat, parseRequest);
    const ratings = require("./routes/ratings")(app, apiProtocole, apiBaseUrl, apiPort, apiUrl, apiUnreachableException, datesFormat, parseRequest);
};


