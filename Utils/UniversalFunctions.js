
var Joi = require('joi');
var async = require('async');
var MD5 = require('md5');
var Boom = require('boom');
var CONFIG = require('../Config');
var Models = require('../Models');
var randomstring = require("randomstring");
var NotificationManager = require('../Lib/NotificationManager');
var validator = require('validator');
var OTP = require('otp.js');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(sesTransport(CONFIG.APP_CONSTANTS.EMAIL_SEND.S_E_S_Config));



var VALID_ERRAND_STATUS_ARRAY = [];
for (var key in CONFIG.APP_CONSTANTS.DATABASE.ERRANDS_STATUS) {
    if (CONFIG.APP_CONSTANTS.DATABASE.ERRANDS_STATUS.hasOwnProperty(key)) {
        VALID_ERRAND_STATUS_ARRAY.push(CONFIG.APP_CONSTANTS.DATABASE.ERRANDS_STATUS[key])
    }
}


/**
 * if will take any kind of error and make it in embedded format as per the project require
 * @param {*} data  (data could be object or string depecds upon the error type)
 */
let sendError = function (data) {
    if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {
        // let errorToSend = Boom.create(data.statusCode, data.customMessage);
        // errorToSend.output.payload.responseType = data.type;
        return data;
    } else {
        let errorToSend = '';
        if (typeof data == 'object') {
            if (data.name == 'MongoError' || data.name == 'BulkWriteError' ) {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
                if (data.code = 11000) {
                    let duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
                    duplicateValue = duplicateValue.replace('}', '');
                    errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + " : " + duplicateValue;
                    if (data.message.indexOf('customer_1_streetAddress_1_city_1_state_1_country_1_zip_1') > -1) {
                        errorToSend = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_ADDRESS.customMessage;
                    }
                }
            } else if (data.name == 'ApplicationError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + ' : ';
            } else if (data.name == 'ValidationError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + data.message;
                console.log(errorToSend);
                errorToSend = errorToSend.split("Path");
                errorToSend = errorToSend[1];
            } else if (data.name == 'CastError') {
                errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage + CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage + data.value;
            } else {
                errorToSend = data.message;
            }
        } else {
            errorToSend = data
        }
        let customErrorMessage = errorToSend;
        if (typeof customErrorMessage == 'string') {
            if (errorToSend.indexOf("[") > -1) {
                customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
            }
            customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
            customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
            customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');
        }
        return Boom.create(400, customErrorMessage);
    }
};


var sendSuccess = function (successMsg, data) {
    successMsg = successMsg || CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT.customMessage;
    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage')) {
        return {statusCode:successMsg.statusCode, message: successMsg.customMessage, data: data || null};

    }else {
        return {statusCode:200, message: successMsg, data: data || null};

    }
};

/*** Check duplicate key if exist in array ***/ 
var checkDuplicateValuesInArray = function (array) {
    console.log('array',array)
    var storeArray = [];
    var duplicateFlag = false;
    if(array && array.length>0){
        for (var i=0; i<array.length;i++){
            if (storeArray.indexOf(array[i]) == -1){
                console.log('push',array[i])
                storeArray.push(array[i])
            }else {
                console.log('break')
                duplicateFlag = true;
                break;
            }
        }
    }
    storeArray = [];
    return duplicateFlag;
};


/** Failer actio of swagger **/ 
var failActionFunction = function (request, reply, source, error) {
    var customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation
    return reply(error);
};

/** Custom queries data value validations **/ 
var customQueryDataValidations = function (type,key, data, callback) {
    var schema = {};
    switch(type){
        case 'PHONE_NO' : schema[key] = Joi.string().regex(/^[0-9]+$/).length(10);
            break;
        case 'NAME' : schema[key] = Joi.string().regex(/^[a-zA-Z ]+$/).min(2);
            break;
        case 'BOOLEAN' : schema[key] = Joi.boolean();
            break;
    }
    var value = {};
    value[key] = data;

    Joi.validate(value, schema, callback);
};

/** Joi object with `authorization` key**/ 
var authorizationHeaderObj = Joi.object({
    authorization: Joi.string().required()
}).unknown();

/** Header content if value is multipart ***/ 
var authorizationHeaderObjForMultipart = Joi.object({
    'content-type': Joi.string().valid('video/mp4').required(),
    authorization: Joi.string().required()
}).unknown();

/** Crypt data using md5 **/ 
var CryptData = function (stringToCrypt) {
    return MD5(MD5(stringToCrypt));
};


/** Generate random string length of 7 **/ 
var generateRandomString = function () {
    return randomstring.generate(7);
};

/** filter data in array **/ 
var filterArray = function (array) {
    return array.filter(function (n) {
        return n != undefined && n != ''
    });
};


var sanitizeName = function (string) {
    return filterArray(string && string.split(' ') || []).join(' ')
};

/** Verify email **/ 
var verifyEmailFormat = function (string) {
    return validator.isEmail(string)
};

/** Get distance between two points using lat and long**/ 
var getDistanceBetweenPoints = function (origin, destination) {
    var start = new GeoPoint(origin.lat, origin.long);
    var end = new GeoPoint(destination.lat, destination.long);
    return  start.distanceTo(end, true);
};

/** Validate value of lat long **/ 
var validateLatLongValues = function (lat, long) {
    var valid = true;
    if (lat < -90 || lat>90){
        valid = false;
    }
    if (long <-180 || long > 180){
        valid = false;
    }
    return valid;
};


/** Generate otp  **/
var generateOTP = () => {
    var GA = OTP.googleAuthenticator;
   return GA.gen(GA.encode('base 32 encoded user secret'));
};


/** Convert object to string **/
function jsonString(data) {
    return JSON.stringify(data);
};


module.exports = {
    sendError: sendError,
    sendSuccess: sendSuccess,
    checkDuplicateValuesInArray: checkDuplicateValuesInArray,
    CryptData: CryptData,
    failActionFunction: failActionFunction,
    NotificationManager: NotificationManager,
    authorizationHeaderObj: authorizationHeaderObj,
    verifyEmailFormat: verifyEmailFormat,
    sanitizeName: sanitizeName,
    getDistanceBetweenPoints: getDistanceBetweenPoints,
    validateLatLongValues: validateLatLongValues,
    filterArray: filterArray,
    CONFIG: CONFIG,
    VALID_ERRAND_STATUS_ARRAY: VALID_ERRAND_STATUS_ARRAY,
    generateRandomString: generateRandomString,
    customQueryDataValidations : customQueryDataValidations,
    generateOTP: generateOTP
};