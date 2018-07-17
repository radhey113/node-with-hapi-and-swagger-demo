'use strict';

let Config = require('../Config');
let async = require('async');
const FCM = require('fcm-node');

const fcm = new FCM(Config.APP_CONSTANTS.SERVER.PUSH_NOTIFICATION_KEY);

let sendSMSToUser = function (criteria, externalCB) {
    console.log('sendSMSToUser');
    let smsOptions=criteria;

    async.series([

         function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);
        }
    });
};

function sendSMS(smsOptions, cb) {
    client.messages.create(smsOptions, function (err, message) {
        console.log('SMS RES', err, message);
        if (err) {
            console.log(err)
        }
        else {
            console.log(message.sid);
        }
    });
    cb(null, null); // Callback is outside as sms sending confirmation can get delayed by a lot of time
}




let sendPushToUser = (deviceToken, data, callback) => {
    console.log("***data******",data,deviceToken);
       let message = {
           to: deviceToken,
           notification: {
               title: Config.APP_CONSTANTS.APP_NAME,
               body: data.msg,
               sound:"default",
               badge:0
           },
           data:data,
           priority: 'high'
       };
        fcm.send(message, function(err, result){
            if (err) {
                console.log("Something has gone wrong!",err);
                callback(null);
            } else {
                console.log("Successfully sent with response: ", result);
                callback(null,result);
            }
        });
};

let sendMultiPushToUser = (deviceToken, data, callback)=>{
        let message = {
            registration_ids: deviceToken,
            notification: {
            title:'MotorNation',
            body: data.msg,
            sound:"default",
            badge:0,
            },
            data:data,
            priority: 'high'
        };
    fcm.send(message, function(err, result){
        if (err) {
            console.log("Something has gone wrong!",err);
            callback(null);
        } else {
            console.log("Successfully sent with response: ", result);
            callback(null,result);
        }
    });
};

module.exports = {
    sendSMSToUser: sendSMSToUser,
    sendPushToUser:sendPushToUser,
    sendMultiPushToUser:sendMultiPushToUser,
};