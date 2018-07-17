'use strict';

const Controller = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Joi = require('joi');
const Config = require('../Config');

let routes = [
    {
        method: 'POST',
        path: '/admin/login',
        config: {
            description: 'Login for Admin',
            tags: ['api', 'admin'],
            handler: function (request, reply) {
                let queryData = {
                    email: request.payload.email,
                    password: request.payload.password
                };
                Controller.AdminController.adminLogin(queryData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                payload: {
                    email: Joi.string().email().required().lowercase().allow(''),
                    password: Joi.string().required().allow('')
                }
            },
            plugins: {
                'hapi-swagger': {
                    payloadType:'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/productCategory',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.addProductCategory(userPayload, userData,  function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Add Category API',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    category        : Joi.string().optional().description("Product category name."),
                    type            : Joi.number().optional().valid(1,2).default(1).description("1-Product Type, 2-Service Type"),
                    id              : Joi.string().optional().description("Product Category Update, only if you want to update any category"),
                    active          : Joi.boolean().optional().description("enable true, disable false, only if you want to update any category"),
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
        path: '/admin/list',
        handler: function (request, reply) {

            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.getList(request.query, userData,  function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Get list API',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                query: {
                    skip:   Joi.number().optional().description("Skip count.").default(0),
                    limit:   Joi.number().optional().description("Limit for document. ").default(100),
                    search: Joi.string().optional().description("Search"),
                    id: Joi.string().optional().description("Search question list with quiz id"),
                    type: Joi.number().optional().description("3- Product Category List, 10- Service Category List").default(3).valid(3,10)
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
        }
    },

    {
        method: 'DELETE',
        path: '/admin/delete',
        handler: function (request, reply) {

            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.deleteDocument(request.query, userData,  function (err, message, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(message,data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Delete API',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                query: {
                    type: Joi.number().description("3- Product Category").required().default(3),
                    id: Joi.string().description("Type for model check").required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
        }
    },






    // {
    //     method: 'POST',
    //     path: '/admin/addQuiz',
    //     handler: function (request, reply) {
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //         if (userData && userData.id) {
    //             Controller.AdminController.addQuiz(userPayload, userData,  function (err, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Add Quiz API',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             payload: {
    //                 quizName:   Joi.string().required().description("Quiz name."),
    //                 id:         Joi.string().optional().description("To Update quiz"),
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType : 'form',
    //                 responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/admin/addQuizQue',
    //     handler: function (request, reply) {
    //
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //
    //         if (userData && userData.id) {
    //             Controller.AdminController.addQuizQuestion(userPayload, userData,  function (err, SUCCESS, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(SUCCESS,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Add Quiz Question',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             payload: {
    //                 question:   Joi.string().required().description("Question."),
    //                 quizId:     Joi.string().required().description("Quiz ID"),
    //                 options:    Joi.array().items(Joi.object().keys({
    //                     optionText : Joi.string().required().description("Enter option text."),
    //                     answer : Joi.boolean().required().description("True for Correct, False for incorrect")
    //                 })).description("Enter Options"),
    //                 id: Joi.string().optional().description("For question update.").allow("").default("")
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         }
    //     }
    // },
    //
    // {
    //     method: 'GET',
    //     path: '/admin/list',
    //     handler: function (request, reply) {
    //
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //         if (userData && userData.id) {
    //             Controller.AdminController.getList(request.query, userData,  function (err, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Get list API',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             query: {
    //                 skip:   Joi.number().optional().description("Skip count.").default(0),
    //                 limit:   Joi.number().optional().description("Limit for document. "),
    //                 search: Joi.string().optional().description("Search"),
    //                 id: Joi.string().optional().description("Search question list with quiz id"),
    //                 type: Joi.number().optional().description("List Type ( 1 For agency, 2 For Quiz, 3 For websites, 4 for users, 5 for quiz question enter quiz id in id field, 6 for batch list )").default(1)
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //     }
    // },
    //
    // {
    //     method: 'POST',
    //     path: '/admin/addWebsite',
    //     handler: function (request, reply) {
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //
    //         if (userData && userData.id) {
    //             Controller.AdminController.addWebsite(userPayload, userData,  function (err, Success, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(Success,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Add website api',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             payload: {
    //                 website:   Joi.string().required().description("Website URL."),
    //                 name:      Joi.string().required().description("Website name."),
    //                 logo:      Joi.string().required().description("original image for logo"),
    //                 thumbnail : Joi.string().required().description("thumbnail image of logo."),
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType : 'form',
    //                 responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // },
    //

    // {
    //     method: 'POST',
    //     path: '/admin/editWebsite',
    //     handler: function (request, reply) {
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //
    //         if (userData && userData.id) {
    //             Controller.AdminController.editWebsite(userPayload, userData,  function (err, Success, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(Success,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Edit website api',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             payload: {
    //                 id:   Joi.string().required().description("Website Id."),
    //                 website:   Joi.string().optional().description("Website URL."),
    //                 name:      Joi.string().optional().description("Website name."),
    //                 logo:      Joi.string().optional().description("original image for logo"),
    //                 thumbnail : Joi.string().optional().description("thumbnail image of logo."),
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType : 'form',
    //                 responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/admin/addBadge',
    //     handler: function (request, reply) {
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //
    //         if (userData && userData.id) {
    //             Controller.AdminController.addBadge(userPayload, userData,  function (err, Success, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(Success,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Add batch api',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             payload: {
    //
    //                 BadgeName: Joi.string().required().description("Add batch name here"),
    //                 BadgePoint: Joi.number().required().description("Batch point for enabling batch for user"),
    //                 image : Joi.string().required().description("image for logo"),
    //                 thumbnail : Joi.string().required().description("thumbnail image of logo."),
    //
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType : 'form',
    //                 responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // },
    //
    // {
    //     method: 'POST',
    //     path: '/admin/editBadge',
    //     handler: function (request, reply) {
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //
    //         if (userData && userData.id) {
    //             Controller.AdminController.editBadge(userPayload, userData,  function (err, Success, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(Success,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'Edit batch api',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         validate: {
    //             payload: {
    //                 id: Joi.string().required().description("Add batch name here"),
    //                 BadgeName: Joi.string().optional().description("Add batch name here"),
    //                 BadgePoint: Joi.number().optional().description("Batch point for enabling batch for user"),
    //                 image : Joi.string().optional().description("image for logo"),
    //                 thumbnail : Joi.string().optional().description("thumbnail image of logo."),
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType : 'form',
    //                 responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // },
    //
    // {
    //     method: 'POST',
    //     path: '/admin/fileUpload',
    //     handler: function (request, reply) {
    //         let userPayload = request.payload;
    //         let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
    //
    //         if (userData && userData.id) {
    //             Controller.AdminController.imageUpload(userPayload, userData,  function (err, Success, data) {
    //                 if (err) {
    //                     reply(UniversalFunctions.sendError(err));
    //                 } else {
    //                     reply(UniversalFunctions.sendSuccess(Success,data))
    //                 }
    //             });
    //         } else {
    //             reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
    //         }
    //     },
    //     config: {
    //         description: 'file upload api',
    //         auth: 'AdminAuth',
    //         tags: ['api', 'admin'],
    //         payload: {
    //             maxBytes: 200000000,
    //             parse: true,
    //             output: 'file',
    //             allow: 'multipart/form-data'
    //         },
    //         validate: {
    //             payload: {
    //                 file:       Joi.any()
    //                                 .meta({ swaggerType: 'file' })
    //                                 .required()
    //                                 .description('File upload')
    //             },
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType : 'form',
    //                 responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // },
    //
    //

];

module.exports = routes;
