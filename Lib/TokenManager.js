'use strict';

let Config = require('../Config');
let Jwt = require('jsonwebtoken');
let async = require('async');
let Service = require('../Services');

let Models = require('../Models');


let getTokenFromDB = function (userId, userType,flag,token, callback) {
    let userData = null;
    let criteria = {
        _id: userId,
        accessToken :token
    };

    async.series([
        function (cb) {

            if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER && flag==='USER'){
                console.log(criteria);
                Service.UserServices.getAll(criteria, {}, {lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }
                });
            }
            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN  && flag==='ADMIN'){
                Service.queries.getData( Models.Admin, criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }
            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.AGENCY  && flag ==='AGENCY'){


                Service.queries.getData(Models.Agencies,criteria,{},{lean:true}, function (err, dataAry) {


                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }
            else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err) {
        if (err){
            callback(err)
        }else {
            if (userData && userData._id){
                userData.id = userData._id;
                userData.type = userType;
            }
            callback(null,{userData: userData})
        }
    });
};

let setTokenInDB = function (userId, userType, tokenToSave, callback) {

    let criteria = {
        _id: userId
    };

    let setQuery = {
           accessToken : tokenToSave
    };

    async.series([
        function (cb) {
             if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER){
                Service.queries.findAndUpdate(Models.Users,criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }
                    }
                });

            }
            else if(userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.AGENCY){
                 Service.AdminService.updateSuperAdmins(criteria,setQuery,{new:true}, function (err, dataAry) {
                     if (err){
                         cb(err)
                     }else {
                         if (dataAry && dataAry._id){
                             cb();
                         }else {
                             cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                         }
                     }
                 });
             }


            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN){
                Service.queries.findAndUpdate(Models.Admin,criteria,setQuery,{new:true , projections: { _v: 0, password: 0 }}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }
                    }
                });
            }
            else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            callback()
        }
    });
};

let expireTokenInDB = function (userId,userType, callback) {
    let criteria = {
        _id: userId
    };
    let setQuery = {
        accessToken : null
    };
    async.series([
        function (cb) {
            if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER){
                Service.UserServices.Users(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }
                });

            }
            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPPLIER){
                Service.SupplierServices.updateSupplier(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }
            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN){
                Service.AdminServices.updateAdmin(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        callback(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            cb();
                        }else {
                            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            callback()
        }

    });
};


let verifyToken = function (token,flag, callback) {

    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(err)
        } else {
            getTokenFromDB(decoded.id, decoded.type,flag,token, callback);
        }
    });
};

let setToken = function (tokenData, callback) {
    if (!tokenData.id || !tokenData.type) {
        callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        let tokenToSend = Jwt.sign(tokenData, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
        setTokenInDB(tokenData.id,tokenData.type, tokenToSend, function (err, data) {
            callback(err, {accessToken: tokenToSend})
        })
    }
};

let expireToken = function (token, callback) {
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            expireTokenInDB(decoded.id,decoded.type, function (err, data) {
                callback(err, data)
            });
        }
    });
};

let decodeToken = function (token, callback) {
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decodedData) {
        if (err) {
            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            callback(null, decodedData)
        }
    })
};

module.exports = {
    expireToken: expireToken,
    setToken: setToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken
};