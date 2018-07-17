'use strict';

const Service = require('../Services');
const UniversalFunctions = require('../Utils/UniversalFunctions');
const async = require('async');
const mongoose = require('mongoose');
const UploadManager = require('../Lib/UploadManager');
const UploadMultipart = require('../Lib/UploadMultipart');
const TokenManager = require('../Lib/TokenManager');
const NotificationManager = require('../Lib/NotificationManager');
const Models = require('../Models');
const Config = require('../Config');

const adminLogin = (userData, callback) => {
    let tokenToSend = null;
    let tokenData = null;
    let dataToSend;
    let Data;

     async.auto({
        checkMail:function(cb){
            let query = {
                email:userData.email
            };
            let options = {
                lean:true
            };
            let projections = {
                accessToken:0,
                _v:0
            };

            Service.queries.getData(Models.Admin,query,projections,options,function(err,result){
                if(err){
                    cb(err)
                }else{

                    if(result && result.length){
                        console.log(result[0].password, UniversalFunctions.CryptData(userData.password));

                        if(result[0].password == UniversalFunctions.CryptData(userData.password)){
                            Data = result;
                            delete Data[0]["password"];

                            tokenData = {
                                id: result[0]._id,
                                username: result[0].name,
                                type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
                            };
                            cb(null)
                        }else{
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
                        }
                    }else{
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
                    }

                }
            })
        },
        TokenManeger:['checkMail',function(cb){
            if (tokenData && tokenData.id) {
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        tokenToSend = output && output.accessToken || null;
                        cb();
                    }
                });
            } else {
                cb();
            }
        }]

    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null, {access_token: tokenToSend,Data:Data})
        }
    })
};


/** Add product categories here **/
const addProductCategory = (payloadData, userData, callback) => {

    let query   = {},
        options = {lean: true, new: true};

    if(!payloadData.id) {

        Service.queries.saveDocument(Models.ProductCategory, payloadData).then(RESULT => {
            return callback(null, RESULT);
        }).catch(ERROR => {
            return callback(ERROR);
        })

    }else{


        query._id = payloadData.id;
        delete payloadData.id;

        Service.queries.findAndStore(Models.ProductCategory, query, payloadData, options).then(RESULT => {
            return callback(null, RESULT);
        }).catch(ERROR => {
            return callback(ERROR);
        })
    }
};



/** Get list feature for models **/
const getList = (payloadData, userData, callback)=> {

    let query = { },
        projection = { __v: 0 },
        options = { lean: true, skip: payloadData.skip, limit: payloadData.limit },
        Model = '';

    switch(payloadData.type){

        case Config.APP_CONSTANTS.LISTING_TYPE.PRODUCT_CATEGORY:
            if(payloadData.search)
                query.category = payloadData.search;
            if(payloadData.id)
                query._id = payloadData.id;
            query.type = 1;
            Model = Models.ProductCategory;
            break;
        case Config.APP_CONSTANTS.LISTING_TYPE.SERVICE_CATEGORY:
            if(payloadData.search)
                query.category = payloadData.search;
            if(payloadData.id)
                query._id = payloadData.id;
            query.type = 2;
            Model = Models.ProductCategory;
            break;

        default:
            break;
    }

    /** Get all agency **/
    Service.queries.getAllDocument( Model, query, projection, options ).then(RESULT => {

        return callback(null, RESULT);
    }).catch(ERROR => {
        return callback(ERROR);
    });

};


/** Delete document **/
const deleteDocument = (payloadData, userData, callback) => {
    let query = { _id : payloadData.id }, query1 = {},
        Model = '', Model1 = '';

    switch(payloadData.type){
        case Config.APP_CONSTANTS.LISTING_TYPE.PRODUCT_CATEGORY:
            Model = Models.ProductCategory;
            break;

        default:
            break;
    }

    /** Delete document **/
    return Service.queries.deleteData( Model, query ).then(RESULT => {

        if(RESULT.result.n && RESULT.result.ok) {
            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED);
        }else{
            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.ERROR.DATA_NOT_FOUND);
        }

    }).catch(ERROR => {
        return callback(ERROR);
    });
};










/**************************************************************************/


/** create agency here **/
const addQuiz = (payloadData, userData, callback) => {

    let query = { },
        dataToUpdate = {},
        option = { lean: true, new: true, upsert: true };

    if(!payloadData.id) {
        /** Save quiz questions here **/

        return Service.queries.saveDocument(Models.QUIZ, payloadData).then(RESULT => {
            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED);
        }).catch(ERROR => {
            return callback(UniversalFunctions.sendError(ERROR));
        })

    }else {
        query._id = payloadData.id;
        delete payloadData.id;

        dataToUpdate = { $set: payloadData };

        /** update quize here **/
        return Service.queries.findAndStore(Models.QUIZ, query, dataToUpdate, option).then(RESULT => {
            callback(null, RESULT);
        }).catch(ERROR => {
            callback(ERROR);
        })
    }
};


/** Add quiz question **/
const addQuizQuestion = (payloadData, userData, callback) => {

     let options = payloadData.options, count = 0;
     payloadData.quizCreatedBy = userData.id;

    /** If there is more than 2 answers availabe or not **/
     Promise.all(options.map( option => {
            option.answer ? count++ : '';
     }));

     if(count > 1){
         return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CUSTOM_ERROR_MESSAG(
             Config.APP_CONSTANTS.CUSTOM_ERROR_MSG.MORE_THEN_ONE_ANSWER,
             400
         ));
     }
     else if(count < 1){
        return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CUSTOM_ERROR_MESSAG(
            Config.APP_CONSTANTS.CUSTOM_ERROR_MSG.NOT_ENTERED_ANSWER,
            400
        ));
     }

     if(!payloadData.id){

         delete payloadData.id;
         /** Add question **/
         return Service.queries.saveDocument(Models.QuizQuestions, payloadData).then(RESULT => {

             return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, null);
         }).catch(ERROR => {

             return callback(UniversalFunctions.sendError(ERROR));
         })
     }else{

         /** Check quiz exist or not  **/
        Service.queries.getOneDocumemt( Models.QUIZ,
            { _id: payloadData.quizId },
            { __v: 0 },
            { lean: true }
        ).then(QUIZ => {

            if(QUIZ){

                return QUIZ;

            }else{

                throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.CUSTOM_ERROR_MESSAG(
                    Config.APP_CONSTANTS.CUSTOM_ERROR_MSG.QUIZ_NOT_FOUNT,
                    422
                )
            }

        }).then(QUIZ => {

            /** If exist then update question **/
            return Service.queries.findAndStore(Models.QuizQuestions,
                { _id: payloadData.id },
                { $set: payloadData },
                { lean: true, new: true, upsert: true }
            ).then(RESULT => {

                return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED.customMessage, null);

            }).catch(ERROR => {

                return callback(ERROR);
            })
        }).catch(ERROR => {
            callback(ERROR);
        });


     }
};

/** Add website **/
const addWebsite = (payloadData, userData, callback) => {

        payloadData.createdByAdmin = userData.id;

        /** Save website **/
        return Service.queries.saveDocument( Models.Website, payloadData).then(RESULT => {

            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED);
        }).catch(ERROR=> {
            return callback(ERROR);
        })
};



/** edit website **/
const editWebsite = (payloadData, userData, callback)=> {


    let query = {    _id: payloadData.id },
        projection= { _id: 1 },
        options= {lean: true},
        imageObj = { };

    async.auto({
        checkWebsite:function(cb){
            Service.queries.getOneDocumemt(Models.Website, query, projection, options).then(WEBSITE => {
                cb()
            }).catch(ERROR => {
                return cb(ERROR)
            })
        },
        updateWebsite: ['checkWebsite', (cb)=>{

            Service.queries.findAndStore( Models.Website, query,
                { $set: payloadData }, { new: true, lean: true }).then(RESULT => {
                    cb(null)
            }).catch(ERROR => {
              cb(ERROR);
            })
        }]
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED);
        }
    })

};

/** Add Badge here with Badge points **/
const addBadge = (payloadData, userData, callback) => {

    /** Save batch here **/
    return Service.queries.saveDocument(Models.Badge, payloadData).then(RESULT => {

        callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, RESULT);
    }).catch(ERROR => {

        callback(ERROR);
    })
};


/** edit Badge **/
const editBadge = (payloadData, userData, callback)=> {

    let query = {    _id: payloadData.id },
        projection= { _id: 1 },
        options= {lean: true};

    async.auto({
        checkWebsite:function(cb){
            Service.queries.getOneDocumemt(Models.Badge, query, projection, options).then(WEBSITE => {
                cb()
            }).catch(ERROR => {
                return cb(ERROR)
            })
        },
        updatBadge: ['checkWebsite', (cb)=>{

            Service.queries.findAndStore( Models.Badge, query,
                { $set: payloadData }, { new: true, lean: true }).then(RESULT => {
                cb(null)
            }).catch(ERROR => {
                cb(ERROR);
            })
        }]
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED);
        }
    })

};


/** Image upload api **/
const imageUpload = (payloadData, userData, callback) => {
    /** image upload **/
    UploadMultipart.uploadFilesOnS3( payloadData.file, (err, imageUrl)=>{
        return err ? callback(err): callback(err, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, imageUrl);
    });
};



//----------------------------------------------------------------------

const memberListing = function(payloadData,userData,callback){
    let totalCount;
    let data;
    async.auto({
        getData:function(cb){

            let query = {
                isAppoved:payloadData.status,
                key:userData.key
            };

            let options = {
                lean:true,
                skip:payloadData.skip,
                limit:20
            };

            let projections = {
                accessToken:0
            }

            Service.queries.getData(Models.Members,query,projections,options,function(err,result){
                if(err){
                    cb(err)
                }else{
                    data = result;
                    cb(null)
                }
            })
        },
        getCount:['getData',function(cb){

            let query = {
                isAppoved:payloadData.status,
                key:userData.key
            };

            let options = {
                lean:true
            };

            let projections = {
                accessToken:0
            }

            Service.queries.getData(Models.Members,query,projections,options,function(err,result){
                if(err){
                    cb(err)
                }else{
                    totalCount = result.length;
                    cb(null)
                }
            })
        }]

    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null,{data:data,count:totalCount})
        }
    })
}


const approveMember = function(payloadData,userData,callback){
    async.auto({
        updateMember:function(cb){

            let query = {
                _id:payloadData._id
            }

            let options = {
                lean:true
            }

            let setData = {
                isAppoved:payloadData.status
            }

            Service.queries.findAndUpdate(query,setData,options,function(err,result) {
                if(err){
                    cb(err)
                }else{
                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null,{})
        }
    })
}


const jobPost = function(payloadData,userData,callback){
    async.auto({
        postJob:function(cb){
            let obj = {
                key:userData.key,
                title:payloadData.title,
                description:payloadData.description,
                vacancy:payloadData.vacancy,
                minSalary:payloadData.minSalary,
                maxSalary:payloadData.maxSalary
            }

            Service.queries.saveData(Models.Jobs,obj,function(err,result){
                if(err){
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null)
        }
    })
}

const listJob = function(queryData,userData,callback){
    let data;
    let count;
    async.auto({
        getList:function(cb){
            let query = {
                key:userData.key,
            }

            let options = {
               lean:true,
                skip:queryData.skip
            };

            let projections = {};

            Service.queries.getData(Models.Jobs,query,projections,options,function(err,result){
                if(err){
                    cb(err)
                }else{
                    data = result;
                    cb(null)
                }
            })
        },
        countJob:function(cb){
            let query = {
                key:userData.key,
            }

            let options = {
                lean:true
            };
            let projections = {};

            Service.queries.getData(Models.Jobs,query,projections,options,function(err,result){
                if(err){
                    cb(err)
                }else{
                    count = result.length;
                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null,{count:count,data:data})
        }
    })
}


const addProducts = function(payloadData,userData,callback){
    async.auto({
        addProduct:function(cb){

            let query = {
                key:payloadData.key,
                name:payloadData.name,
                description:payloadData.description,
                quantity:payloadData.quantity,
                price:payloadData.price,
            };

            Service.queries.saveData(query,function(err,result){
                if(err){
                    cb(err)
                }else{
                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null);
        }
    })
}



const findAdmin = (key, callback) => {
    let query = {
        key:key,
        type:1
    };
    let options = {
        lean:true
    };
    let projections = {
        _id:1
    };
    Service.queries.getData(Models.Admins,query,projections,options,function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null,result[0]._id)
        }
    })
};

const approveStroies = function(payloadData,callback){
    let query = {
        key:payloadData.key,
        _id:payloadData.id
    };
    let options = {
        lean:true
    };
    let projections = {
        status:true
    };

    Service.queries.findAndUpdate(query,projections,options,function(err,result){
        if(err){
            callback(err)
        }else{
            callback(null)
        }
    })
};




module.exports = {
    adminLogin: adminLogin,
    addProductCategory: addProductCategory,
    addQuiz: addQuiz,
    getList:getList,
    addQuizQuestion: addQuizQuestion,
    addWebsite: addWebsite,
    deleteDocument: deleteDocument,
    editWebsite: editWebsite,
    addBadge: addBadge,
    editBadge: editBadge,
    imageUpload: imageUpload,

    memberListing:memberListing,
    approveMember:approveMember,
    jobPost:jobPost,
    listJob:listJob,
    addProducts:addProducts,
    findAdmin:findAdmin,
    approveStroies:approveStroies
};