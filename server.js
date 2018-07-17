
'use strict';

let Hapi        = require('hapi');
let Config      = require('./Config');
const async     = require('async');
let Routes      = require('./Routes');
let Plugins     = require('./Plugins');
let mongoose    = require('mongoose');
let Bootstrap   = require('./Utils/BootStrap');

/** Creating server with Hapi **/ 
let server = new Hapi.Server({
    app: {
        name: Config.APP_CONSTANTS.SERVER.APP_NAME
    }
});

server.connection({
    port: Config.dbConfig.config.PORT,
    routes: { cors: true }
});


server.register(Plugins, function (err) {
    if (err){
        server.error('Error while loading plugins : ' + err)
    }else {
        server.route(Routes);
        server.log('info','Plugins Loaded')
    }
});

Bootstrap.bootstrapAdmin(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
    }
});
Bootstrap.bootstrapAppVersion(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
    }
});

// Bootstrap.connectSocket(server);

server.on('response', function (request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() +
        ' ' + request.url.path + ' --> ' + request.response.statusCode);
    console.log('Request payload:', request.payload);
});

server.start(
    console.log('Server running at:', server.info.uri)
);
