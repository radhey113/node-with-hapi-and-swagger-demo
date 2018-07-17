'use strict';

let mongoose          = require('mongoose');
let Config            = require('../Config');
let SocketManager     = require('../Lib/SocketManager');
let Service           = require('../Services').queries;
let Models            = require('../Models');
let async             = require('async');
let UniversalFunction = require('./UniversalFunctions');

//Connect to MongoDB
mongoose.connect(Config.dbConfig.config.dbURI, { useMongoClient: true }, function (err) {

    if (err) {
        console.log("DB Error: ", err);
        process.exit(1);
    } else {
        console.log('MongoDB Connected');
    }
});

exports.bootstrapAdmin = function (callback) {

    let adminData1 = {
        email: 'admin@leila.com',
        password: 'fa59d2b94e355a8b5fd0c6bac0c81be5',
        name: 'laila'
    };
    let adminData2 = {
        email: 'radhey@laila.com',
        password: 'fa59d2b94e355a8b5fd0c6bac0c81be5',       //asdfghjkl
        name: 'laila'
    };
    let adminData3 = {
        email: 'test@laila.com',
        password: 'fa59d2b94e355a8b5fd0c6bac0c81be5',       //asdfghjkl
        name: 'laila'
    };
    async.parallel([
        function (cb) {
            insertData(adminData1.email, adminData1, cb)
        },
        function (cb) {
            insertData(adminData2.email, adminData2, cb)
        },
        function (cb) {
            insertData(adminData3.email, adminData3, cb)
        }
    ], function (err, done) {
        callback(err, 'Bootstrapping finished');
    })
};

exports.bootstrapAppVersion = function (callback) {
    let appVersion1 = {
        latestIOSVersion: '100',
        latestAndroidVersion: '100',
        criticalAndroidVersion: '100',
        criticalIOSVersion: '100',
        appType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER,
    }; let appVersion2 = {
        latestIOSVersion: '100',
        latestAndroidVersion: '100',
        criticalAndroidVersion: '100',
        criticalIOSVersion: '100',
        appType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUBADMIN,
    }; let appVersion3 = {
        latestIOSVersion: '100',
        latestAndroidVersion: '100',
        criticalAndroidVersion: '100',
        criticalIOSVersion: '100',
        appType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN,
    };
    async.parallel([
        function (cb) {
            insertVersionData(appVersion1.appType, appVersion1, cb)
        }, function (cb) {
            insertVersionData(appVersion2.appType, appVersion2, cb)
        }, function (cb) {
            insertVersionData(appVersion3.appType, appVersion3, cb)
        }
    ], function (err, done) {
        callback(err, 'Bootstrapping finished For App Version');
    })
};

function insertVersionData(appType, versionData, callback) {
    let needToCreate = true;
    async.series([
        function (cb) {
        let criteria = {
            appType: appType
        };
        Service.getData(Models.AppVersions,criteria, {}, {}, function (err, data) {
            if (data && data.length > 0) {
                needToCreate = false;
            }
            cb()
        })
    }, function (cb) {
        if (needToCreate) {
            Service.saveData(Models.AppVersions,versionData, function (err, data) {
                cb(err, data)
            })
        } else {
            cb();
        }
    }], function (err, data) {
        console.log('Bootstrapping finished for ' + appType);
        callback(err, 'Bootstrapping finished For Admin Data')
    })
}

function insertData(email, adminData, callback) {
    let needToCreate = true;
    async.series([function (cb) {
        let criteria = {
            email: email
        };
        Service.getData(Models.Admin,criteria, {}, {}, function (err, data) {
            if (data && data.length > 0) {
                needToCreate = false;
            }
            cb()
        })
    }, function (cb) {
        if (needToCreate) {
            adminData.password = UniversalFunction.CryptData(adminData.password);
            Service.saveData(Models.Admin,adminData, function (err, data) {
                cb(err, data)
            })
        } else {
            cb();
        }
    }], function (err, data) {
        console.log('Bootstrapping finished for ' + email);
        callback(err, 'Bootstrapping finished')
    })
}

exports.connectSocket = SocketManager.connectSocket;


