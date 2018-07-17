
'use strict';

const pack = require('../package');
const Inert = require('inert');
const Vision = require('vision');


//Register Swagger
const options = {
    info: {
        'title': 'Cloudapp API Documentation',
        'version': pack.version
    }
};

//Register All Plugins
exports.register = function(server, options, next){
    server.register([
        Inert,
        Vision,
        {'register': require('hapi-swagger'),
            'options': options}
    ], function (err) {
        if (err) {
            server.log(['error'], 'hapi-swagger load error: ' + err)
        }else{
            server.log(['start'], 'hapi-swagger interface loaded')
        }
    });
    next()
};



exports.register.attributes = {
    name: 'swagger-plugin'
};

