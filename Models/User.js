
'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let SchemaType= Schema.ObjectId;

let Config = require('../Config');

let UserMessage = new Schema({
    email        : { type: SchemaType, ref: 'Users', index: true },
    password     : { type: SchemaType, ref: 'Users', index: true  },
    registerOn   : { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserMessage);