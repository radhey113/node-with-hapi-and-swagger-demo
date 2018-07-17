'use strict';
const Controller = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Joi = require('joi');
const Constants = require('../Config/appConstants');

module.exports = [

    {
        method: 'POST',
        path: '/user/login',
        handler: function (request, reply) {
            console.log(request.payload);
            let userPayload = request.payload;
            Controller.UserController.login(userPayload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    console.log(data);
                    reply(UniversalFunctions.sendSuccess(null,data))
                }
            });
        },
        config: {
            description: 'Login User API',
            tags: ['api', 'Users'],
            validate: {
                payload: {
                    username    : Joi.string().description("Enter username").required(),
                    gmailId     : Joi.string().description("Enter password").required(),
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/editProfile',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.editUserProfile(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            }else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Edit User Profile API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    firstName   : Joi.string().optional().description("first name for user profile"),
                    lastName    : Joi.string().optional().description("last name for user profile"),
                    phoneNumber : Joi.string().optional().description("phoneNumber for user profile"),
                    original    : Joi.string().optional().description("Orignal url"),
                    thumbnail   : Joi.string().optional().description("Thumbnail url")
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/toggelPushnotificationStatus',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.changePushNotificationStatus(userPayload, userData, function (err, success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(success, data))
                    }
                });
            }else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Enable or Disable Push Notification API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                payload: {
                    id          : Joi.string().description("If you want to desable or enable notification for user post"),
                    status      : Joi.number().required().description("status should be 0 (desable) or 1 (enable)"),
                    type        : Joi.number().required().valid(Constants.LISTING_TYPE.USER, Constants.LISTING_TYPE.TEXT_DISCUSION).description('8-User, 4-UserPost')
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/logout',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.logout(request.payload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null,data));
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Logout User API',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                payload: {
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/user/list',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.list(request.query, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null,data));
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Listing API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                query: {
                   id           : Joi.string().optional().description("Search through id, No need for follower and followings list"),
                   search       : Joi.string().optional().description("search with name, No need for follower and followings list"),
                   type         : Joi.number().required().description("1 For Followings, 2 For Follower, 3 For Product Category list, 10 for Service Category list, 7 for Product Review, 11 for Service, 12 for Marketing Product").valid(1,2,3,7,10,11, 12).default(1),
                   limit        : Joi.number().optional().description("Record limit"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'GET',
        path: '/user/userPostList',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.userPostList(request.query, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null,data));
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'User Post Listing API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                query: {
                    id           : Joi.string().optional().description("Post id for single post"),
                    type         : Joi.number().required().description("4 for discussion section, 5 for video section").valid(4,5).default(4),
                    limit        : Joi.number().optional().description("Record limit"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'GET',
        path: '/user/accessTokenLogin',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.accessTokenLogin(request.query, userData, function(ERR, msg, data){
                    if(ERR){
                       return reply(UniversalFunctions.sendError(ERR));
                    }

                    reply(UniversalFunctions.sendSuccess(msg, data));
                });
            } else {

                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Access Token Login API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/user/otherUserProfile',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.otherUserProfile(request.query, userData, function(ERR, msg, data){
                    if(ERR){
                       return reply(UniversalFunctions.sendError(ERR));
                    }

                    reply(UniversalFunctions.sendSuccess(msg, data));
                });
            } else {

                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Other user profile API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                query: {
                    id    : Joi.string().required().description("user id for user profile"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/fileUpload',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.imageUpload(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'File Upload API',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            payload: {
                maxBytes: 200000000,
                parse: true,
                output: 'file',
                allow: 'multipart/form-data'
            },
            validate: {
                payload: {
                    file:   Joi.any()
                                .meta({ swaggerType: 'file' })
                                .required()
                                .description('File upload')
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/exteranlUse/fileUpload',
        handler: function (request, reply) {
            let userPayload = request.payload;

            Controller.UserController.imageUpload(userPayload, {} ,  function (err, Success, data) {
               if (err) {
                   reply(UniversalFunctions.sendError(err));
               } else {
                   reply(UniversalFunctions.sendSuccess(Success,data))
               }
            });
        },
        config: {
            description: 'File Upload API',
            auth: false,
            tags: ['api', 'user'],
            payload: {
                maxBytes: 200000000,
                parse: true,
                output: 'file',
                allow: 'multipart/form-data'
            },
            validate: {
                payload: {
                    file:   Joi.any()
                                .meta({ swaggerType: 'file' })
                                .required()
                                .description('File upload')
                },
                // headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'POST',
        path: '/user/userPost',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.userPost(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Upload/Edit Discussion (Text/Media) API',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    textPost    : Joi.string().description("Text Post"),
                    original    : Joi.string().description("Original Url"),
                    thumbnail   : Joi.string().description("Thumbnail Url"),
                    type        : Joi.number().description("Type 1 for Text Post, 2 for Media Uplaod").required(),
                    editType    : Joi.number().description("1 for save, 2 for edit"),
                    id          : Joi.string().description("Id of user post if you want to edit it"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/likeDislikeComUserPost',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.uPostLikeDislikeCom(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Like, dislike, comment for user post or discussion section API',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    id              : Joi.string().description("Id of user post"),
                    comment         : Joi.string().description("Comment for post"),
                    type            : Joi.number().required().valid(1, 2, 3).default(1).description("Like for 1, Dislike for 2, Comment for 3")
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/likeComment',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.likeDislikeComment(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Like comment of the post',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    id              : Joi.string().description("Id of comment")
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/ufollow',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.ufollow(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Follow User API',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    id    : Joi.string().required().description("user Id whome you are going to follow"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/busProfile',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.busProfile(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Set/Edit User Business Profile API',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    firstName      : Joi.string().optional().description("Enter firstname"),
                    lastName       : Joi.string().optional().description("Enter lastname"),
                    email          : Joi.string().email().lowercase().optional().description("Enter email"),
                    phoneNumber    : Joi.string().optional().description("Enter mobile number"),
                    titile         : Joi.string().optional().description("Enter title"),
                    description    : Joi.string().optional().description("Enter description"),
                    original       : Joi.string().optional().description("Enter original image url"),
                    thumbnail      : Joi.string().optional().description("Enter thumbnail image url"),
                    webSite        : Joi.string().optional().description("Enter Business website"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'GET',
        path: '/user/sendOtp',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.sendOtp(request.query, userData, function (err, success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(success,data));
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Send Otp to phone number API',
            auth: 'UserAuth',
            tags: ['api', 'Users'],
            validate: {
                query: {
                    phoneNumber: Joi.string().description("Send otp to phone number Not Ready Yet")
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'POST',
        path: '/user/postNotificationStatus',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.postNotification(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Enable notification for user post',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    type      : Joi.number().required().description("1-userPost").valid(1).default(1),
                    id        : Joi.string().required().description("id of post or product")
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/user/otherUserPAndRList',
        handler: function (request, reply) {
            let userPayload = request.query;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.otherUserProductAndReviewList(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Other user product and review list',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                query: {
                    type      : Joi.number().required().description("1-Product, 2- Review").valid(1,2).default(1),
                    id        : Joi.string().required().description("id of user"),
                    limit     : Joi.number().optional().description('limit for pagination if required'),
                    offset    : Joi.number().optional().description("Offset for pagination if required")
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/user/getProductAndReviewWithCategoryId',
        handler: function (request, reply) {
            let userPayload = request.query;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;

            if (userData && userData.id) {
                Controller.UserController.getProAndRevWithCatId(userPayload, userData,  function (err, Success, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(Success,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Get product, product review, service review list according to the category id',
            auth: 'UserAuth',
            tags: ['api', 'user'],
            validate: {
                query: {
                    type      : Joi.number().required().description("1-Product Review, 2- Service Review, 3-Product").valid(1,2,3).default(1),
                    id        : Joi.string().required().description("id of category"),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

];
