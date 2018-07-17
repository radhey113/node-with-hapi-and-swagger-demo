'use strict';
const Service             = require('../Services');
const UniversalFunctions  = require('../Utils/UniversalFunctions');
const async               = require('async');
const UploadManager       = require('../Lib/UploadManager');
const TokenManager        = require('../Lib/TokenManager');
const NotificationManager = require('../Lib/NotificationManager');
const CodeGenerator       = require('../Lib/CodeGenerator');
const Config              = require('../Config');
const moment              = require('moment');
const Models              = require('../Models');
const UploadMultipart     = require('../Lib/UploadMultipart');
const _                   = require('lodash');
const uniqid              = require('uniqid');
const request             = require('request');


/**
 *
 * @param payloadData post request payload data
 * @param callback return error or response data
 */
const registerUser = (payloadData, callback) => {

    let  tokenData;
    let admin = '';
    let data;
    async.auto({
        checkEmail:function(cb){

            let query = { email:payloadData.email };
            let options = { lean:true };
            let proejctions = { _id: 1 };

            Service.queries.getData(Models.Users, query,proejctions,options,function(err,result){
                if(err){
                    cb(err)
                }else{
                    if(result && result.length){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXIST);
                    }else{
                        cb(null)
                    }
                }
            })
        },
        registerMember:['checkEmail',function(cb){
            let obj = {
                name:payloadData.name,
                email:payloadData.email,
                password:UniversalFunctions.CryptData(payloadData.password),
                deviceType:payloadData.deviceType,
                deviceToken:payloadData.deviceToken,
                description:payloadData.description,
                phoneNumber:payloadData.phoneNumber,
                countryCode:payloadData.countryCode,
                admin:admin
            };

            Service.queries.saveData(Models.Users,obj,function(err,result){
                if(err){
                    cb(err)
                }else{
                    data  = result;
                    tokenData = {
                        id: result._id,
                        username: result.name,
                        type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER
                    };
                    cb(null)
                }
            })

        }],
        TokenSet:['registerMember',function(cb){
            if(tokenData && tokenData.id){
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        tokenData = output && output.accessToken || null;
                        cb();
                    }
                });
            }else{
                cb(null)
            }
        }]
    },function(err,result){
        if(err){
            callback(err)
        }else{
            data.accessToken = tokenData
            callback(null,data)
        }
    })
};

/** It can be useful in future **/
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

/**
 *
 * @param userData request payload or query
 * @param callback returns error or data
 */
const login = (userData,callback) => {
    let Data;
    let tokenData, userProfileData = '';
    let isExist = false;

    let CRITERIA_ARRAY = [], criteria = {};

     userData.fbId ? CRITERIA_ARRAY.push({ fbId: userData.fbId }): '';
     !userData.fbId ? userData.gmailId ? CRITERIA_ARRAY.push({ gmailId: userData.gmailId }) : '' : '';

     criteria["$or"] = CRITERIA_ARRAY;
     console.log(criteria);


     let imageUrl = {};

     imageUrl.original  = userData.original ? userData.original : '';
     imageUrl.thumbnail = userData.thumbnail ? userData.thumbnail: '';

     delete userData.original;
     delete userData.thumbnail;

     userData.imageUrl = imageUrl;
     console.log(imageUrl, userData);


    async.auto({
        checkEmail:function(cb){

            let query = {
                $or: CRITERIA_ARRAY
            };

            let options = {
                lean:true
            };

            let projections = {};

            return Service.queries.getOneDocumemt(Models.Users, query, projections, options).then( USER => {

                return USER;
            }).then(USER=> {
                if(USER){

                    isExist = true;

                    if(USER.gmailId){
                        USER.gmailId = userData.gmailId;
                    }
                    if(userData.fbId){
                        USER.fbId = userData.fbId;
                    }

                    options.new = true;
                    Service.queries.findAndStore(Models.Users, query, { $set: USER }, options).then(USER => {
                        tokenData = {
                            id          : USER._id,
                            username    : USER.name,
                            email       : USER.email,
                            fbId        : USER.fbId,
                            gmailId     : USER.gmailId,
                            referalCode : USER.referalCode,
                            type        : UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER
                        };
                        delete USER.password;
                        userProfileData = USER;
                        return cb();

                    }).catch(ERROR => {

                        return cb(ERROR)
                    })
                }else{
                    cb();
                }

            }).catch(ERROR => {
                cb(ERROR);
            })
        },
        ISEXIST:['checkEmail',function(cb){

            if(!isExist){

                userData.referalCode = uniqid.time();

                Service.queries.saveDocument(Models.Users, userData).then(USER => {

                    tokenData = {
                            id          : USER._id,
                            username    : USER.name,
                            email       : USER.email,
                            fbId        : USER.fbId,
                            gmailId     : USER.gmailId,
                            referalCode : USER.referalCode,
                            type        : UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER
                    };
                    delete USER.password;
                    userProfileData = USER;
                    cb();
                }).catch(ERROR => {

                   return cb(ERROR);
                });
            }else{
                cb();
            }
        }],
        TokenSet:['ISEXIST',function(cb){

            if(tokenData && tokenData.id){
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        tokenData.accessToken = output && output.accessToken || null;
                        userProfileData.accessToken = output && output.accessToken || null;
                        cb();
                    }
                });
            }else{
                cb(null)
            }
        }]
    },function(err,result){
        if(err){
           return callback(err)
        }else{
            if(userProfileData._doc) {
                delete userProfileData._doc.password;
            }
           return callback(null,userProfileData)
        }
    });
};

/**
 * Update user data
 * @param payloadData request payload for data
 * @param callback to send error or data to frontend
 */
const editUserProfile = (payloadData, userData, callback) => {

    let query = {
        _id:userData.id,
        isBlocked:false
    };

    let projection = { _v: 0 };

    let options = {
        lean:true,
        projection: projection
    };

    let dataToUpdate = {};
    console.log(payloadData);
       /**
       * object containing
       * @original image url
       * @thumbnail image url
       * */
       if(payloadData.firstName) {
            dataToUpdate["firstName"] = payloadData.firstName;
       }
       if(payloadData.lastName) {
            dataToUpdate["lastName"] = payloadData.lastName;
       }
       if(payloadData.phoneNumber) {
            dataToUpdate["phoneNumber"] = payloadData.phoneNumber;
       }

       if(payloadData.original) {
           dataToUpdate["imageUrl.original"] = payloadData.original;
       }

       if(payloadData.thumbnail) {
           dataToUpdate["imageUrl.thumbnail"] = payloadData.thumbnail;
       }

       options.new = true;
       dataToUpdate = { $set: dataToUpdate };

       /** update user data **/
       return Service.UserServices
              .updateUserData(query, dataToUpdate, options)
              .then(USER => {

                  callback(null, USER);
              }).catch(Error => {
                  callback(Error);
        });
};


/**
 * change pushnotification status
 * @param payload
 * @param callback
 */
const changePushNotificationStatus = (payloadData, userData, callback)=> {


    let query = {}, Model = '', dataToUpadate ={};
    let queryFun = [];
    let options = {
        lean: true,
        new: true,
        projection: {}
    };

    // if(payloadData.type !== Config.APP_CONSTANTS.LISTING_TYPE.USER && !payloadData.id){
    //     return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CUSTOM_ERROR_MESSAG(Config.APP_CONSTANTS.CUSTOM_ERROR_MSG.ID_MISSING, 400))
    // }

    switch (payloadData.type){
        case Config.APP_CONSTANTS.LISTING_TYPE.USER:
            query._id = userData.id;
            Model = Models.Users;

            dataToUpadate = {
                $set: {pushNotificationStatus: payloadData.status }
            };
            options.projection.pushNotificationStatus = 1;

            queryFun.push(
                Service.queries.findAndStore(Model, query, dataToUpadate, options)
            );

            break;

        case Config.APP_CONSTANTS.LISTING_TYPE.TEXT_DISCUSION:
            query.userPostId = payloadData.id;

            payloadData.status = payloadData.status? true : false;

            console.log("payloadData.status: ", payloadData.status);
            Model = Models.NotificationStatusForPosts;
            dataToUpadate =  {notificationStatus: payloadData.status };
            options.projection.notificationStatus = 1;

            queryFun.push(
                Model,
                query,
                { _id: 1},
                { lean: true }
            );

            break;
    }

    /** update push notification status **/
    return Promise.all(queryFun).then(RESULT=> {

        if(payloadData.type === Config.APP_CONSTANTS.LISTING_TYPE.USER) {
            callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, RESULT[0]);
        }else{
            // if(RESULT[0]){
                queryFun = [];

                if(!payloadData.status){
                    queryFun.push(Service.queries.deleteData(Models.NotificationStatusForPosts, query));
                }else{

                    let toUpdate = {
                       $set : {
                           userId: userData.id,
                           userPostId: payloadData.id,
                           type: 1
                       }
                    };

                    queryFun.push(
                        Service.queries.findAndStore(
                        Models.NotificationStatusForPosts,
                        query,
                        toUpdate,
                        {lean: true, upsert: true, new: true }
                        ))
                    }

                queryFun.push(Service.queries.findAndStore(
                    Models.UserPosts,
                    { _id: payloadData.id },
                    dataToUpadate,
                    options
                    )
                );

                Promise.all(queryFun).then(RESULT => {

                    callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, dataToUpadate);

                }).catch(ERROR => {

                    callback(ERROR);

                })
                // }
            }
    }).catch(ERROR => {

        callback(ERROR);
    })
};



/**  **/
const userPost = (payloadData, userData, callback)=>{

    let data = { }, funRef;
    let query =  { _id: payloadData.id ? payloadData.id : '' };
    let projection = { __v: 0 };
    let options = { lean: true, new: true, projection: projection };

    data.userId = userData.id;

    /** Check type for text and media type of post **/
    switch(payloadData.type){
        case 1:
            data.textPost = payloadData.textPost;
        break;
        case 2:

            if(payloadData.textPost){
                data.textPost = payloadData.textPost;
            }
            data.type = payloadData.type;
            if(payloadData.original){
                data.media = [{
                    original  : payloadData.original ? payloadData.original : '',
                    thumbnail : payloadData.thumbnail ? payloadData.thumbnail : '',
                }]
            }
        break;
            
        default:
        break;
    }

    /** Check editType save data or edit existing data **/
    switch (payloadData.editType){
        case 1:
            /** Passing funciton to single variable **/
            funRef = Service.queries.saveDocument(Models.UserPosts, data);
        break;
        case 2:
            data = { $set: data };
            /** Passing funciton to single variable **/
            funRef = Service.queries.findAndStore(Models.UserPosts, query, data, options);
        break;
        default:
            return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.SOMETHING_WENT_WRONG);
    }

    /** Operational funciton **/
    funRef.then(RESULT => {
        if(RESULT) {

            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, RESULT);
        }else{

            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND);
        }
    }).catch(ERROR => {
        return callback(ERROR);
    });
};



/** for like dislike comment **/
const uPostLikeDislikeCom = (payloadData, userData, callback) => {

    /** Queries and projections **/
    let query = { userPostId: payloadData.id, type: payloadData.type, userId: userData.id },
        projection = { _id: 1 }, options = { lean: true, new: true }, dataToUpdate = {},
        dataToSave = {
            userId: userData.id,
            userPostId: payloadData.id,
            type: payloadData.type
        };
    let updateType, notificationMsg, notificationMsgForOthers, userNotificationStatus, postUser, pushNotificationData = {};

    switch (payloadData.type){
        case Config.APP_CONSTANTS.E_NUMS.LIKE_DISLIKE[0]:
            updateType = "like";
            notificationMsg = Config.APP_CONSTANTS.NotificationMessage.like;
            notificationMsgForOthers = Config.APP_CONSTANTS.NotificationMessage.likeBy;
        break;
        case Config.APP_CONSTANTS.E_NUMS.LIKE_DISLIKE[1]:
            updateType = 'dislike';
        break;
        case Config.APP_CONSTANTS.E_NUMS.LIKE_DISLIKE[2]:
            updateType = 'numberOfReply';
            notificationMsg = Config.APP_CONSTANTS.NotificationMessage.comment;
            notificationMsgForOthers = Config.APP_CONSTANTS.NotificationMessage.commentBy;
            dataToSave.comment = payloadData.comment;
        break;
    }


    /** Find the userpost **/
    let result =  Service.queries.getOneDocumemt(
                    Models.UserPostLikeDislikeCom,
                    query, projection, options
                  );
    projection.notificationStatus = 1;
    projection.textPost = 1;
    projection.userId = 1;
    let checkPost = Service.queries.getPopulatedData(
                    Models.UserPosts,
                    { _id: payloadData.id  },
                    projection,
                    { lean: true },
                    { path: "userId" }

    );

    /** Check Data from parallel call **/
    Promise.all([
        result,
        checkPost,
        Service.queries.getOneDocumemt(
            Models.Users,
            { _id: userData.id  },
            projection,
            { lean: true }
        )
    ]).then(RESULT => {

           if(!RESULT[1] || !RESULT[2]){
               throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.DATA_NOT_FOUND;
           }
           else {
               postUser = RESULT[1][0];
               if (RESULT[0] && payloadData.type !== Config.APP_CONSTANTS.E_NUMS.LIKE_DISLIKE[2]) {

                   /** Delete data form UserPostLikeDislikeCom MOdel **/
                   return Service.queries.deleteData(
                       Models.UserPostLikeDislikeCom,
                       query
                   ).then(RESULT => {

                       dataToUpdate = { $inc: {[updateType]: -1} };
                       return dataToUpdate;

                   }).catch(ERROR => {
                       throw ERROR;
                   });

               } else {
                   userNotificationStatus = postUser.userId.pushNotificationStatus ? true : false;
                   dataToUpdate = {$inc: {[updateType]: 1}};

                   console.log('RESULT[1]: ',RESULT[1]);

                   /** Saving data **/
                   return Service.queries.saveDocument(Models.UserPostLikeDislikeCom, dataToSave).then(RESULT => {

                       if (RESULT) {
                           if(payloadData.type === Config.APP_CONSTANTS.E_NUMS.LIKE_DISLIKE[2]) {
                               dataToUpdate.userPostCommentId = RESULT._id;
                           }
                           return dataToUpdate;
                       } else {
                           throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND;
                       }

                   }).catch(ERROR => {

                       throw ERROR;
                   });
               }
           }

        }).then(dataToUpdate => {

            // /** Update like(remove, add) dislike(remove, add) and comment(add only) **/
            return Service.queries.findAndStore(

                Models.UserPosts,
                { _id: payloadData.id },
                dataToUpdate,
                options

            ).then(RESULT => {
                // postUser.deviceToken = "du7JIMUXWLc:APA91bEVRWGgTDCyS_Rqi1h4u-xevNghGrUgXfVlOokjceuMqysJINkeZiK56LsGy44qujxhzdXZwRJ4K8AlDUDZeTW04AxOFhaxBvj7Hgodq1ah3D5SXIHJ5Evu2mh26XuvSuKjDAjq";
                if(!userNotificationStatus){
                    pushNotificationData.msg = Config.APP_CONSTANTS.NotificationMsg(Config.APP_CONSTANTS.NotificationMessage.like, userData.firstName);
                    pushNotificationData.type = Config.APP_CONSTANTS.E_NUMS.LIKE_DISLIKE[0];
                    NotificationManager.sendPushToUser(postUser.userId.deviceToken,  pushNotificationData, (ERR, NOTIFICATION_STATUS)=>{
                        console.log("Notification Status during like or comment: ", ERR, NOTIFICATION_STATUS);
                    })
                }
               return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, RESULT);

            }).catch(ERROR => {
                throw ERROR;
                //
                //     postUser.notificationStatus=true;
                //     if(postUser.notificationStatus && updateType !== 'dislike'){
                //         query = { userPostId: postUser._id }, projection = { __v: 0 }, options = {lean: true};
                //
                //         Service.queries.getPopulatedData(
                //             Models.UserPostLikeDislikeCom,
                //             query,
                //             projection,
                //             options,
                //             { path: "userId", match: { pushNotificationStatus: 1 } }
                //         ).then(USERS => {
                //
                //             let UserLenght = USERS.length, NotificationData =[], token =[], partitionData =[], tokenData = [],
                //             data = {
                //                 images: userData.imageUrl,
                //                 firstName: userData.firstName,
                //                 postId: postUser._id,
                //                 msg: Config.APP_CONSTANTS.NotificationMsg(notificationMsgForOthers, userData.firstName)
                //             };
                //
                //             for(let index = 0; index < UserLenght; index++){
                //
                //                 // if ( index % 2 === 0 ){
                //                 //     index -= 1;
                //                     NotificationData.push({
                //                         userId: USERS[index].userId._id,
                //                         text: postUser.textPost,
                //                         type: 1,
                //                         postId: postUser._id
                //                     });
                //                     // token.push(USERS[index].userId.deviceToken);
                //                     token.push(USERS[index].userId.deviceToken);
                //                 // }else{
                //                 //     partitionData.push(NotificationData);
                //                 //     tokenData.push(token);
                //                 //     NotificationData = [];
                //                 //     tokenData = []
                //                 // }
                //             }
                //
                //             Service.queries.insertMany(Models.Notifications, NotificationData).then(RESULT => {
                //
                //                 NotificationManager.sendMultiPushToUser(token, data, (err, result) => {
                //                     console.log("notification to multiple users: ", err, result);
                //                 })
                //
                //             }).catch(ERROR => {
                //                 console.log("Saving push notification: ", ERROR);
                //             })
                //
                //         }).catch(ERR => {
                //             throw ERR;
                //         })
                //     }
            });

        }).catch(ERROR => {

            return callback(ERROR);
        });

};

/** Follow a user **/
const ufollow = (payloadData, userData, callback) => {

    /**Criteria**/
    let criteria = { _id: payloadData.id },
        userId = JSON.stringify(userData.id),
        projection = { _id: 1 },
        options = { lean: true };

    /**data to save the user**/
    let dataToSave = {
        follower    : userData.id,
        userId      : payloadData.id
    };

    /** query to check the user is exist of not **/
    let query = [Service.queries.getOneDocumemt(
                    Models.Users,
                    criteria,
                    projection,
                    options
                )];
    query.push(
        Service.queries.getOneDocumemt(
            Models.FollowFollowiing,
            dataToSave,
            projection,
            options
        )
    );


    payloadData.id = JSON.stringify(payloadData.id);

    if(payloadData.id === userId){
        return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOLLOW_URSELF);
    }
    else{
        /** Check user is exist or not **/
        Promise.all(query).then(USER => {
            if(USER){
                return USER;
            }else{

                throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.DATA_NOT_FOUND
            }
        })
        .then(USER => {

            /** Saving follower data to model **/
            if(USER[1]) {
                console.log(USER[1]);

                return Service.queries.deleteData(Models.FollowFollowiing, USER[1]).then(DOCUMENT => {

                    return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);

                }).catch(ERROR => {

                    throw ERROR;
                })
            }else if(USER[0]){
                return Service.queries.saveDocument(Models.FollowFollowiing, dataToSave).then(DOCUMENT => {

                    return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, DOCUMENT);
                }).catch(ERROR => {
                    throw ERROR;
                })
            }

        }).catch(ERROR => {
            return callback(ERROR);
        })
    }
};

/***Set/Edit Business profile***/
const busProfile = (payloadData, userData, callback)=> {

    payloadData.userId = userData.id;
    payloadData.isBusiness = true;

    if(payloadData.original){
        payloadData.imageUrl = {
            original    : payloadData.original,
            thumbnail   : payloadData.thumbnail
        };

        delete  payloadData.original;
        delete  payloadData.thumbnail;
    }

        payloadData.about = {
            titile      : payloadData.titile ? payloadData.titile : '',
            description : payloadData.description ? payloadData.description : ''
        };

        delete  payloadData.titile;
        delete  payloadData.description;

    let Data = payloadData,
        Model = Models.Users,
        criteria = {_id: userData.id},
        projection= { __v : 0 },
        options = { lean: true, new: true, upsert: true, setDefaultsOnInsert: true,  projection: projection};


    Service.queries.findAndStore(Model, criteria, Data, options).then(BUS_PROFILE => {

        if(BUS_PROFILE) {
            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, BUS_PROFILE);
        }else{
            throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.DEFAULT;
        }

    }).catch(ERROR => {

        return callback(ERROR);
    })
};

/** Send otp **/
const sendOtp = (payloadData, userData, callback) => {

    return callback(null, null, payloadData);
};



/**  Like dislike comments**/
const likeDislikeComment = (payloadData, userData, callback) => {

    let dataToUpdate = {};
    userData.id = String(userData.id);

    /** get document**/
    Service.queries.getOneDocumemt(

        Models.UserPostLikeDislikeCom,
        {  _id: payloadData.id, likeByUserId: userData.id },
        {__v: 0},
        { lean: true }
        ).then(RESULT => {
           return RESULT;

    }).then(COMMENT => {

        if(COMMENT){
            dataToUpdate = { $inc: {like: -1}, $pull: { likeByUserId: userData.id }};
        }else{
            dataToUpdate = { $inc: {like: 1}, $push: { likeByUserId: userData.id }};
        }

        return Service.queries.findAndStore(

            Models.UserPostLikeDislikeCom,
            { _id: payloadData.id },
            dataToUpdate,
            {lean: true, new : true, projection: { likeByUserId: 0, __v: 0 }}
            ).then(Comment => {

           return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, Comment);
        }).catch(e => {

            throw e;
        })

    }).catch(error=>{
        console.log("error:--- ",error)
        callback(error);
    });
};











/**
 * Change Password
 * **/
const changePassword = (payloadData, callback) => {

    let query = { _id: payloadData.id };
    let dataToUpdate = {
        password: UniversalFunctions.CryptData(payloadData.password)
    };

    let projection = { _v: 0 };
    let options = {lean : true, new: true};


    return Service.UserServices.getOneDataModel(Models.Users, query, projection, options).then( USER => {

        if(!USER){
            throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.DATA_NOT_FOUND;
        }
        else if( USER && USER.password === dataToUpdate.password ){
            throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.OLD_PASSWORD_ENTERED;
        }

        return USER;
    }).then(USER => {

          return Service.UserServices.updateUserData(query, { $set: dataToUpdate }, options).then(RESULT => {
                 callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED);
          }).catch(ERROR => {
                 throw ERROR;
          });

    }).catch(ERROR => {
        callback(ERROR);
    });
};


/**
 * it is used for forget password
 * @param payloadData ( With Email )
 * @param callback ( return the success or failure  message )
 */
const forgetPassword = (payloadData ,callback) => {

    let data;
    let query = {
        email: payloadData.email
    };
    let projections = {
        _v: 0
    };
    let options = {
        new: true,
        lean: true
    };
    /** Get USER from user Model **/
    Service.UserServices.getOneDataModel(Models.Users, query, projections, options)
        .then(USER => {
            if (USER) {
                return USER;
            } else {
                throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.USERNAME_NOT_FOUND
            }
        }).then(USER => {
        let OTP = UniversalFunctions.generateOTP();

        data = {
            otp: OTP,
            userId: USER._id
        };

        delete query["email"];

        query.userId = USER._id;
        query.otp = OTP;

        return Service.queries.findAndStore(Models.OTP, query, {$set: data}, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });
    }).then(OTP_RESULT => {

        /** sent OTP to mail would come here **/
        UniversalFunction.sendUserforgotMail(
            payloadData.email,
            Config.APP_CONSTANTS.EMAIL_STATUS.FORGET_PASSWORD,
            Config.APP_CONSTANTS.EMAIL_CONTENT.FORGET_CONTENT +OTP_RESULT.otp , (err, res)=>{

            if(err)
                return callback(err);
            else
                return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.OTP_SENT);
        });

    }).catch(ERROR => {
        return callback(ERROR);
    });
};


/** Change password through otp **/
const ChangePassword_OTP = (payloadData ,callback) => {

    let query = { email: payloadData.email };
    let dataToUpdate = { };
    let projection = { _id: 1, otp: 1 };

    /** check user exists or not user password here **/
    Service.queries.getData(Models.Users, query, projection, { lean: true }, (ERR, USER) => {
        if(ERR){
            callback(ERR);
        }
        else if(!USER){
            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.USERNAME_NOT_FOUND);
        }
        else{

            delete query["email"];
            query.userId = USER[0]._id;
            query.otp = payloadData.otp;

            /** check OTP and user Id in OTP collections user password here **/
            Service.queries.getOneDocumemt(Models.OTP, query, projection, { lean: true } ).then(OTP_DOC => {
                if(!OTP_DOC){
                    throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CODE
                }
                else{
                    if(OTP_DOC.otp === payloadData.otp){

                        return OTP_DOC;
                    }else{

                     throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CODE
                    }
                }

            }).then(OTP_DOC => {
                payloadData.password = UniversalFunctions.CryptData(payloadData.password);

                query._id = query.userId;

                delete query["userId"];
                delete query["otp"];

                dataToUpdate.password = payloadData.password;

                /** update user password here **/
                return Service.queries.findAndStore(Models.Users, query, { $set: dataToUpdate }, { lean: true, new: true })
                    .then(USER=> {
                      if(USER){

                          callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_CHANGE);

                      }else{

                          callback(null, Config.APP_CONSTANTS.STATUS_MSG.ERROR.USERNAME_NOT_FOUND);
                      }
                    }).catch(ERROR => {

                        throw ERROR;
                    })
            }).catch(ERROR => {

                callback(ERROR);
            })
        }
    });
};


/** Logout User **/
const logout = (payloadData, userData, callback) => {
    let query = { _id: userData.id },
        dataToUpdate = { $set: { accessToken: '' } },
        options = { lean: true, new : true };

    /** logout user by updating accesstoken 'null' **/
    Service.queries.findAndStore(Models.Users, query, dataToUpdate, options).then(STATUS => {
        console.log(STATUS);
        return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED);
    }).catch(ERROR => {
        return callback(ERROR);
    });
};



/****
 * Payload for getting data in query
 * @param payloadData
 * @param userData
 * @param callback sending response data or error
 */
const list = (payloadData, userData, callback)=> {

    let query= {},
        projection = { __v: 0 },
        options = { lean: true, limit: payloadData.limit ? payloadData.limit : 100 },
        Model = '',
        populatedData = {},
        queries = [],
        index = 0,
        check = 0,
        commentCount = 0;

    switch(payloadData.type){

        case Config.APP_CONSTANTS.LISTING_TYPE.FOLOWING:

            if(payloadData.search)
                query.quizName = payloadData.search;

            query.follower = userData.id;
            Model = Models.FollowFollowiing;
            populatedData.path = 'userId';
            populatedData.select = { email: 1, _id: 1, name: 1, imageUrl: 1 };
            check = 1;

            queries.push(Service.queries.getPopulatedData( Model, query, projection, options, populatedData ));
            break;

        case Config.APP_CONSTANTS.LISTING_TYPE.FOLOWER:
            if(payloadData.search)
                query.name = payloadData.search;

            check = 1;
            query.userId = userData.id;
            Model = Models.FollowFollowiing;
            populatedData.path = 'follower';
            populatedData.select = { email: 1, _id: 1, name: 1, imageUrl: 1 };
            queries.push(Service.queries.getPopulatedData( Model, query, projection, options, populatedData ));
            queries.push(Service.queries.getAllDocument( Model, { follower: userData.id }, projection, options ));
            break;

        case Config.APP_CONSTANTS.LISTING_TYPE.PRODUCT_CATEGORY:
            if(payloadData.search)
                query.category = payloadData.search;
            if(payloadData.id)
                query._id = payloadData.id;
            query.active = true;
            query.type = 1;
            Model = Models.ProductCategory;
            queries.push(Service.queries.getAllDocument(Model, query, projection, options));
            check = 0;
            break;

        case Config.APP_CONSTANTS.LISTING_TYPE.SERVICE_CATEGORY:
            if(payloadData.search)
                query.category = payloadData.search;
            if(payloadData.id)
                query._id = payloadData.id;
            query.active = true;
            query.type = 2;
            Model = Models.ProductCategory;
            queries.push(Service.queries.getAllDocument(Model, query, projection, options));
            check = 0;
            break;
        case Config.APP_CONSTANTS.LISTING_TYPE.PRODUCT_REVIEW:
            if(payloadData.search)
                query.name = payloadData.search;
            if(payloadData.id) {
                query._id = payloadData.id;
            }

            query.type = 1;
            Model = Models.Products;
            options.sort = { registerOn: -1 };
            populatedData.path = "productLastComment";
            populatedData.populate = { path : "commentBy", select: { _id: 1, firstName: 1, lastName: 1, imageUrl: 1 } };
            populatedData.select = { __v: 0, like: 0, type: 0 };
            queries.push(Service.queries.getPopulatedData(Model, query, projection, options, populatedData));
            // commentCount = Model.count({ prductReviewId:  })


            check = 0;
            break;
        case Config.APP_CONSTANTS.LISTING_TYPE.SERVICE:
            if(payloadData.search)
                query.name = payloadData.search;
            if(payloadData.id)
                query._id = payloadData.id;

            query.type = 2;
            Model = Models.Products;
            options.sort = { registerOn: -1 };
            populatedData.path = "productLastComment";
            populatedData.populate = { path : "commentBy", select: { _id: 1, firstName: 1, lastName: 1, imageUrl: 1 } };
            populatedData.select = { __v: 0, like: 0, type: 0 };
            queries.push(Service.queries.getPopulatedData(Model, query, projection, options, populatedData));
            check = 0;
            break;
        case Config.APP_CONSTANTS.LISTING_TYPE.MARKETING_PRODUCT:
            if(payloadData.search)
                query.name = payloadData.search;
            if(payloadData.id)
                query._id = payloadData.id;

            query.type = 3;
            Model = Models.Products;
            options.sort = { registerOn: -1 };
            queries.push(Service.queries.getAllDocument(Model, query, projection, options));
            check = 0;
            break;

        // case Config.APP_CONSTANTS.LISTING_TYPE.PRODUCT_REVIEW:
        //     if(payloadData.search)
        //         query.title = payloadData.search;
        //     if(payloadData.id)
        //         query._id = payloadData.id;
        //
        //     Model = Models.ProductReviews;
        //     queries.push(Service.queries.getAllDocument(Model, query, projection, options));
        //     check = 0;
        //     break;

        default:
            console.log("no type selected.");
            break;
    }

    /** Get all agency **/
    Promise.all(queries).then(RESULT => {

        let ARRAY1 = RESULT[0], ARRAY2, lengthOfFOLLOWERS;
        if(check) {
            if (payloadData.type === Config.APP_CONSTANTS.LISTING_TYPE.FOLOWER) {
                ARRAY2 = RESULT[1], lengthOfFOLLOWERS = RESULT[0].length;

                /** Set all following keys false and Changing keys for modelinig **/
                ARRAY1 = UniversalFunctions.followFollowingArrayReturn(payloadData.type, ARRAY1, ARRAY2);

                /** Check if user also following you **/
            } else {

                /** Changing keys for modelinig **/
                ARRAY1 = UniversalFunctions.followFollowingArrayReturn(payloadData.type, ARRAY1, []);

            }

            return callback(null, ARRAY1);
        }
        else if( payloadData.type ===  Config.APP_CONSTANTS.LISTING_TYPE.PRODUCT_REVIEW || payloadData.type ===  Config.APP_CONSTANTS.LISTING_TYPE.SERVICE ){

            let productReviewData = RESULT[0];

                Promise.all(productReviewData.map((data, index) => {
                    return Service.queries.countDoc(Models.ProductReviewComment, {prductReviewId: productReviewData[index]._id}).then(countOfComment => {
                        productReviewData[index].commentCount = countOfComment;
                        return productReviewData[index];
                    }).catch(error => {
                        callback(error);
                    })
                })).then(RESULT => {

                    console.log('***********************');
                    callback(null, RESULT);
                }).catch(ERROR => {
                    console.log(ERROR);
                    callback(ERROR);
                })
        }
        else{
            return callback(null, RESULT[0]);
        }

    }).catch(ERROR => {

        return callback(ERROR);
    });
};


/** User post list **/
const userPostList = (payloadData, userData, callback)=> {

    let Model = '', Model1 = '', queries = [], query = {},
        projection = {__v: 0}, options = { lean: true, sort: { registerOn: -1 } }, populatedData=[];
    let lengthOfResult;

    let AllComment = 0;

        if(payloadData.id){
            query._id = payloadData.id;
            AllComment = 1;
        }

            Model = Models.UserPosts;
            Model1= Models.UserPostLikeDislikeCom;

            switch (payloadData.type){
                case Config.APP_CONSTANTS.LISTING_TYPE.TEXT_DISCUSION:
                    query.type = 1;
                break;
                case Config.APP_CONSTANTS.LISTING_TYPE.MEDIA_DISCUSION:
                    query.type = 2;
                break;
                default:
                    break;
            }

            populatedData=[{
                path :'userPostCommentId', match: { type: 3 },
                populate: [{
                    path :'userId',
                    select: { email: 1, _id: 1, name: 1, imageUrl: 1, firstName: 1, lastName: 1 },
                },
                {
                        path :'likeByUserId',
                        select: { email: 1, _id: 1, name: 1, imageUrl: 1, firstName: 1, lastName: 1 },
                }]
            },{
                path :'userId',
                select: { email: 1, _id: 1, name: 1, imageUrl: 1, firstName: 1, lastName: 1 },
            }];

    Service.queries.getPopulatedData( Model, query, projection, options, populatedData).then(RESULT => {

        if(payloadData.id){
            RESULT = RESULT[0];

            if(AllComment && RESULT){
                query.type = 3;
                query.userPostId = query._id;
                delete query._id;

                Service.queries.getPopulatedData(

                    Models.UserPostLikeDislikeCom,
                    query, {__v: 0, userPostId: 0, UserComments: 0},
                    { lean: true },
                    { path: 'userId', select: { email: 1, _id: 1, name: 1, imageUrl: 1, firstName: 1, lastName: 1 } }
                    ).then(COMMENTS => {

                    delete RESULT.userPostCommentId;

                    RESULT.postComments = COMMENTS;

                    let i = RESULT.usersNotifications.findIndex(function (user) {
                        user.userId = JSON.stringify(user.userId);
                        userData.id = JSON.stringify(userData.id);
                        return user.userId === userData.id;
                    });

                    if(i > -1){
                        RESULT.notificationStatus = true;
                        delete RESULT.usersNotifications;
                    }

                    return callback(null, RESULT);

                } ).catch(ERROR => {

                    console.log(ERROR);
                    throw ERROR;
                })
            }else{
                if(!RESULT){
                    throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.DATA_NOT_FOUND;
                }
                return callback(null, RESULT);
            }
        }else{

            lengthOfResult = RESULT.length;
            for(let index = 0; index < lengthOfResult; index++){
                if(RESULT[index].usersNotifications) {

                    let i = RESULT[index].usersNotifications.findIndex(function (user) {
                        user.userId = JSON.stringify(user.userId);
                        userData.id = JSON.stringify(userData.id);
                        return user.userId === userData.id;
                    });
                    if(i > -1){
                        RESULT[index].notificationStatus = true;
                        delete RESULT[index].usersNotifications;
                    }
                }
            }

            return callback(null, RESULT);
        }

    }).catch(ERROR => {
        return callback(ERROR);
    });
};



/** Access token login **/
const accessTokenLogin = (payloadData, userData, callback)=> {

    let queries = [], query={follower: userData.id}, projection={__v: 0}, options={lean: true};
    let populatedData={ path: "userId", select: { imageUrl: 1, firstName: 1, lastName: 1 } };
    let query2 = { userId: userData.id };

    if(payloadData.id){
        query.userId = payloadData.id,
        query2.follower =  payloadData.id
    }

    let populatedData2 = {};
    populatedData2.path = 'follower';
    populatedData2.select = { email: 1, _id: 1, name: 1, imageUrl: 1 };

    queries.push(
        Service.queries.getPopulatedData( Models.FollowFollowiing, query, projection, options, populatedData )
    );
    queries.push(
        Service.queries.getPopulatedData( Models.FollowFollowiing, query2 , projection, options, populatedData2 )
    );

    let populatedData3 = {};
    populatedData3.path = "productLastComment";
    populatedData3.populate = { path : "commentBy", select: { _id: 1, firstName: 1, lastName: 1, imageUrl: 1 } };
    populatedData3.select = { __v: 0, like: 0, type: 0 };
    queries.push(
        Service.queries.getAllDocument( Models.FollowFollowiing, { follower: userData.id }, projection, options )
    );

    queries.push(
        Service.queries.getAllDocument( Models.Products, { userId: userData.id, type: 3 }, projection, options )
    );

    queries.push(
        Service.queries.getPopulatedData( Models.Products, { userId: userData.id, $or: [ { type: 1 }, { type: 2 }] }, projection, options, populatedData3 )
    );

    Promise.all(queries).then(RESULT => {
        let following = UniversalFunctions.followFollowingArrayReturn(1, RESULT[0]);
        let follower = UniversalFunctions.followFollowingArrayReturn(2, RESULT[1], RESULT[2]);
        userData.following = following;
        userData.follower = follower;

        // if(payloadData.id){
        //     projection.password = 0;
        //     Service.queries.getOneDocumemt(Models.Users, {_id: payloadData.id}, projection, options).then(USER => {
        //
        //         res.profile = USER;
        //         res.product = RESULT[5];
        //         res.review = RESULT[6];
        //         return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, res);
        //     }).catch(ERROR => {
        //         return callback(ERROR);
        //     });
        // }else {
            delete userData.password;
            userData.product = RESULT[3];
            userData.review = RESULT[4];
            callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, userData);
        // }
    }).catch(ERROR => {
       callback(ERROR);
    });

};



/** Other user profile **/
const otherUserProfile = (payloadData, userData, callback) => {

    let queryFun = [],
        Criteria = { _id: payloadData.id },
        Projection = { __v: 0 },
        Options = { lean: true },
        populatedData = { path: "userId", select: { imageUrl: 1, firstName: 1, lastName: 1 } };
    let populatedData2 = {};
    populatedData2.path = 'follower';
    populatedData2.select = { email: 1, _id: 1, name: 1, imageUrl: 1 };

    queryFun.push(
        Service.queries.getOneDocumemt( Models.Users,  Criteria, Projection, Options)
    );

    /** For followings **/
    queryFun.push(
        Service.queries.getPopulatedData( Models.FollowFollowiing,  { follower: payloadData.id }, Projection, Options, populatedData )
    );


    /** Logged in token user following **/
    queryFun.push(
        Service.queries.getPopulatedData( Models.FollowFollowiing, { follower: userData.id }, Projection, Options, populatedData )
    );

    /** For followers **/
    queryFun.push(
        Service.queries.getPopulatedData( Models.FollowFollowiing, { userId: payloadData.id } , Projection, Options, populatedData2)
    );

    Promise.all(queryFun).then(RESULT => {

        if(RESULT[0]) {

            let USERDATA = {};
            USERDATA = RESULT[0];

            // USERDATA.totoalFollowing = RESULT[1] ? RESULT[1].length : 0;
            // USERDATA.totoalFollower = RESULT[3] ? RESULT[3].length : 0;
            let following = UniversalFunctions.otherUserFollowFollowing(RESULT[1], RESULT[2], userData.id, 1);
            let follower = UniversalFunctions.otherUserFollowFollowing(RESULT[3], RESULT[2], userData.id, 2);

            USERDATA.following = following;
            USERDATA.follower = follower;

            callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, USERDATA);
        }
        else {
            throw Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND;
        }

    }).catch(ERROR => {
        callback(ERROR);
    });
};




/****  Post notification*****/
const postNotification =  (payloadData, userData, callback) => {

    let query = { _id: payloadData.id, "usersNotifications.userId": userData.id }, projection = { __v: 0 }, options = { lean: true }, dataToUpdate = {};

    Service.queries.getOneDocumemt(Models.UserPosts, query, projection, options)
        .then(RESULT => {
            if(RESULT){
                dataToUpdate= { $pull: { usersNotifications : {userId : userData.id } } };
            }else{
                dataToUpdate= { $push: { usersNotifications: { userId: userData.id } } };
            }

            return RESULT;
        }).then(RESULT => {
            options.new = true;
            options.projection = projection;

            return Service.queries.findAndStore(
                Models.UserPosts,
                { _id: payloadData.id },
                dataToUpdate,
                options
                ).then(QUERYDATA => {

                QUERYDATA.notificationStatus = true;
                callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, QUERYDATA);
            }).catch(ERROR => {
                throw ERROR;
            });

        }).catch(ERROR => {
            callback(ERROR);
        });

};


/** Image upload api **/
const imageUpload = (payloadData, userData, callback) => {
    /** image upload **/
    UploadMultipart.uploadFilesOnS3( payloadData.file, (err, imageUrl)=>{
        return err ? callback(err): callback(err, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, imageUrl);
    });
};

/*other user product and service list*/
const otherUserProductAndReviewList = (payloadData, userData, callback) => {
        let Model = Models.Products;
        let Criteria = { userId: payloadData.id},
            Projection = { __v: 0 },
            Options = { lean: true };

        if(payloadData.type === 1) {
            Criteria.type = 3;
        }else {

            Criteria['$or'] = [
                {type: 1},
                {type: 2}
            ];
        }
        console.log("Criteria: ", JSON.stringify(Criteria));


        return Service.queries.getAllDocument(Model, Criteria, Projection, Options).then(RESULT => {

            return callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, RESULT);

        }).catch(ERROR => {
            callback(ERROR);
        })
};



/** Product and review **/
const getProAndRevWithCatId = (payloadData, userData, callback) => {

    let funRefference = [];
    let Criteria = {
        type: payloadData.type,
        categoryId: payloadData.id
        },
        Projection = { __v: 0 },
        Options = { lean: true },
        Populate = {
            path: 'productLastComment',
            select: { __v: 0, type: 0, like: 0 },
            populate: {
                path: 'commentBy',
                select: { imageUrl: 1, firstName: 1, lastName: 1 }
            }
        };

    // funRefference.push(
    //     Service.queries.getOneDocumemt(
    //         Models.ProductCategory,
    //         { _id: payloadData.id },
    //         Projection,
    //         Options,
    //     )
    // );


    funRefference.push(
        Service.queries.getPopulatedData(
            Models.Products,
            Criteria,
            Projection,
            Options,
            Populate
        )
    );


    return Promise.all(funRefference).then(RESULT => {


        let ArrayOfResults = RESULT[0];
        console.log("payloadData", ArrayOfResults);

        Promise.all(ArrayOfResults.map((data, index) => {
            return Service.queries.countDoc(Models.ProductReviewComment, {prductReviewId:data._id}).then(countOfComment => {
                data.commentCount = countOfComment;
                return data;
            }).catch(error => {
                callback(error);
            })
        })).then(RESULT => {

            console.log('***********************',RESULT);
            callback(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, ArrayOfResults);
        }).catch(ERROR => {
            console.log(ERROR);
            callback(ERROR);
        });




    }).catch(ERROR => {
        callback(ERROR);
    });

};


module.exports = {
    registerUser: registerUser,
    login:login,
    userPost: userPost,
    editUserProfile: editUserProfile,
    uPostLikeDislikeCom: uPostLikeDislikeCom,
    ufollow: ufollow,
    busProfile: busProfile,
    sendOtp: sendOtp,
    likeDislikeComment:likeDislikeComment,
    forgetPassword: forgetPassword,
    ChangePassword_OTP: ChangePassword_OTP,
    findAdmin:findAdmin,
    changePushNotificationStatus: changePushNotificationStatus,
    changePassword: changePassword,
    logout: logout,
    list:list,
    imageUpload: imageUpload,
    userPostList: userPostList,
    postNotification: postNotification,
    accessTokenLogin: accessTokenLogin,
    otherUserProfile: otherUserProfile,
    otherUserProductAndReviewList: otherUserProductAndReviewList,
    getProAndRevWithCatId: getProAndRevWithCatId
};