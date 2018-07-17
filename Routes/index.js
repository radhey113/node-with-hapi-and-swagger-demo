/**
 * Created by shahab on 10/7/15.
 */
'use strict';

var UsersRoute   = require('./UsersRoute');
var AdminRoutes  = require('./Admin');

/** Concatinate all the route files in array **/ 
var all = [].concat(AdminRoutes, UsersRoute);

module.exports = all;

