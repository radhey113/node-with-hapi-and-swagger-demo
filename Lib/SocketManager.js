'use strict';
let  Config = require('../Config');
let  Service = require('../Services');
let  async = require('async');
let  UploadManager = require('../Lib/UploadManager');
let  file = require('../Controllers/UserController');
let  NotificationManager = require('../Lib/NotificationManager');
const mongoose = require('mongoose');
let UniversalFunctions = require('../Utils/UniversalFunctions');
var socket = null;
var all={};
var Fs = require('fs');
var Path = require('path');
var fsExtra = require('fs-extra');
// var download = require('download-file');
// const OpenTok = require('opentok');
// const Thumbler = require('thumbler');
// const opentok = new OpenTok('45967182', '753a756aec520ab5a875e9a89264effc56891fc4');
var AWS = require("aws-sdk");


AWS.config.update({
    accessKeyId:Config.awsS3Config.s3BucketCredentials.accessKeyId,
    secretAccessKey: Config.awsS3Config.s3BucketCredentials.secretAccessKey,
    //  region:' '
});
let s3 = new AWS.S3();

// exports.connectSocket = function (server) {
//     if (!server.app) {
//         server.app = {}
//     }
//     server.app.socketConnections = {};
//     socket = require('socket.io').listen(server.listener);
//
//     socket.on('connection', function (socket) {
//
//         console.log("connected from client ",socket.id);
//
//         socket.on('UserAuth', function (data) {
//
//             verifyToken(data, function (err, response) {
//                 if(response){
//                     all[response.userData._id]=socket.id;
//                     console.log("_______________all__________",all);
//                     updateSocketId(socket.id,response.userData._id,function (err,res) {
//                     })
//                 } else {}
//             })
//         });
//
//         socket.on('sendMessage', function (data) { ////senderId,receiverId,message,messageType
//             console.log('dataaaaaaaaaaaa',data)
//             if (data.senderId && data.receiverId) {
//                 saveMessage(data, function (err, result) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log(".............result.........");
//                     }
//                 })
//             } else {
//                 console.log("data not in format");
//             }
//
//         });
//
//         socket.on('liveComment', function (data) { ////userId,postId,text,imageUrl,firstName,lastName
//             if (data.userId && data.postId) {
//                 socket.broadcast.emit('comment',data);
//                 saveComments(data,function (err, result) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log(".............result.........");
//                     }
//                 })
//             } else {
//                 console.log("data not in format");
//             }
//         });
//
//
//         socket.on('endLive', function (data) { ////userId,postId,text,imageUrl,firstName,lastName
//
//             if (data.postId) {
//                 socket.broadcast.emit('end',{postId:data.postId,endLive:true});
//                 endLive(data, function (err, result) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                     }
//                 })
//             } else {
//                 console.log("data not in format");
//             }
//         });
//
//         socket.on('disconnect', function () {
//             console.log('Socket disconnected---->>>>>>>>>', server.app.socketConnections,all);
//
//             if (all.hasOwnProperty(socket.id)) var userId = all[socket.id];
//
//             if (all.hasOwnProperty(userId)) delete all[userId];
//             if (all.hasOwnProperty(socket.id)) delete all[socket.id];
//        /*
//             if (server.app.socketConnections.hasOwnProperty(socket.id)) var userId = server.app.socketConnections[socket.id].userId;
//             if (server.app.socketConnections.hasOwnProperty(userId)) delete server.app.socketConnections[userId];
//             if (server.app.socketConnections.hasOwnProperty(socket.id)) delete server.app.socketConnections[socket.id];*/
//         });
//     });
//
// };
//
//
//
// exports.postEmit=function (array) {
//     console.log('===========================socket postEmit',array,all);
//    array.map((obj)=>{
//        let to = all[obj];
//        console.log('tooooooooooooooooo',to)
//        if(to){
//            socket.to(to).emit("newPost",'New post is added');
//        }
//        else {
//            getSocketIdFromDb(obj,function (err,res) {
//                socket.to(res).emit("newPost",'New post is added');
//            })
//        }
//    })
// };
//
//
// let endLive = ((payloadData, callback)=> {
//     async.auto({
//         set:function (cb) {
//             var saveData={
//                 sessionId:''
//             };
//             Service.PostServices.updatePost({_id:payloadData.postId}, saveData,{new:true},function (err, result) {
//                 cb()
//             })
//         },
//         get:function (cb) {
//             setTimeout(function () {
//                 getArchieve(payloadData,cb)
//             },138000)
//         },
//     }, function (err) {
//         if (!err) {
//             callback(null);
//         } else {
//             callback(err);
//         }
//     })
// });
//
// var getArchieve=(data,cb)=>{
//     console.log('arrrrchiiiiiiiiiii',data)
//     opentok.getArchive(data.archieveId, function(err, archive) {
//         if (err) {cb(err)
//             console.log(err);}
// else {
//             var url = UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL+'45967182/'+data.archieveId+'/'+'archive.mp4';
//             console.log('urlllllllllllllllll',url)
//             var options = {
//                 directory:Path.resolve('.') + '/uploads',
//                 filename: data.postId +".mp4"
//             };
//             download(url, options, function(err,res){
//                 if (err) console.log('############',err)
//                 else {
//                     console.log("meow",res)
//                     var videoPath=res
//                     if(res){
//                         Thumbler({
//                             type: 'video',
//                             input: res,  //video file path
//                             output: Path.resolve('.') + '/uploads/' + data.postId +'.jpeg',
//                             time: '00:00:01',
//                             size: '300x200'
//                         }, function (err,res) {
//                             console.log('????????///',err,res);
//                             var path=res
//                             Fs.readFile(path, (err, fileData) => {
//                                 s3.putObject({
//                                     Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
//                                     Key: data.postId+'.jpeg',
//                                     Body: fileData,
//                                     ACL: 'public-read',
//                                     ContentType: 'image/jpeg'
//                                 },function (err,res) {
//                                     if(res){
//                                         fsExtra.remove(path, function (err) {
//                                             console.log('deleting file>>',err)
//                                         });
//                                         fsExtra.remove(videoPath, function (err) {
//                                             console.log('deleting file videoPath >>',err)
//                                         });
//                                         var saveData={
//                                             $push:{
//                                                 imageVideoUrl:{
//                                                     original:url,
//                                                     thumbnail:UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL+ data.postId +'.jpeg',
//                                                     type:'VIDEO'
//                                                 }
//                                             },
//                                             isBlocked:false,
//                                             postDate:+new Date(),
//                                             sessionId:''
//                                         };
//                                         Service.PostServices.updatePost({_id:data.postId}, saveData,{new:true},function (err, result) {
//                                             getUserInfo(result.postBy,function (err,result) {
//                                                 if(result.length){
//                                                     result.map((obj)=>{
//                                                         let to = all[obj];
//                                                         if(to){
//                                                             socket.to(to).emit("newPost",'New post is added');
//                                                         }
//                                                         else {
//                                                             getSocketIdFromDb(obj,function (err,res) {
//                                                                 if(res){
//                                                                     socket.to(res).emit("newPost",'New post is added');
//                                                                 }
//                                                                 else {}
//                                                             })
//                                                         }
//                                                     });
//                                                     cb();
//                                                 }
//                                                 else {
//                                                     cb()
//                                                 }
//
//                                             })
//
//                                         })
//                                     }
//                                 });
//
//                             });
//
//                         });
//                     }
//                 }
//
//             });
//
//
//         }
//
//     });
// };
//
//
// const getUserInfo = (userId, callback) => {
//     let data=[];
//     let criteria = {
//         _id: userId,
//     };
//     Service.UserServices.getUser(criteria, {followers:1}, {lean: true}, function (err, result) {
//         if (err) {
//             callback(err);
//         }
//         else {
//             if (!result) {
//                 callback();
//             } else {
//                 result[0].followers.map((obj)=>{
//                     data.push(obj.followBy)
//                 });
//                 callback(null,data);
//             }
//         }
//     })
// };
//
// var saveComments = ((payloadData, callback)=> {
//     async.auto({
//         update: function (cb) {
//             let criteria={
//                 _id:payloadData.postId
//             };
//            let dataToUpdate={
//                 $push:{
//                     comments:{
//                         commentBy:payloadData.userId,
//                         time:+new Date(),
//                         text:payloadData.text
//                     }
//                 },
//                 $inc:{commentsCount: 1}
//             };
//             Service.PostServices.updatePost(criteria, dataToUpdate, {new:true},function (err, result) {
//               cb()
//             })
//         },
//     }, function (err) {
//         if (!err) {
//             callback(null);
//         } else {
//             callback(err);
//         }
//     })
// });
//
//
// const updateSocketId = function (socketId, userId, cb) {
//     let criteria = {
//         _id: userId,
//     };
//     let dataToSave = {
//         socketId:socketId
//     };
//     let option = {new:true};
//     Service.UserServices.updateUser(criteria, dataToSave, option, function (err, result) {
//         if (err) {
//             cb()
//         } else {
//             cb(null, result)
//         }
//     })
// };
//
//
// const saveMessage = function (data, callback) {
//     let chatExist = 0;
//     let saveChat;
//     let message = {};
//     let name=data.senderName;
//     let senderId=data.senderId;
//     message.senderName=name;
//     message.receiverId = data.receiverId;
//     if(data.postId){
//         message.postId=data.postId;
//         message.postType=data.postType;
//     }
//     else {
//         message.postId='';
//             message.postType='';
//     }
//     message.senderId = data.senderId;
//     message.message = data.message;
//     message.timeStamp = +new Date();
//     message.messageType=data.messageType;
//     if(data.original){
//         message.imageUrl={
//             original:data.original,
//             thumbnail:data.thumbnail
//         }
//     }
//     else {
//         message.imageUrl={
//             original:'',
//             thumbnail:''
//         }
//     }
//     let c1={user1: data.senderId,user2: data.receiverId};
//     let c2={user1:data.receiverId,user2: data.senderId};
//
//     async.auto({
//
//         checkBlock:function (cb) {
//             let criteria= {
//                 $or:[
//                     {
//                         _id:data.receiverId,
//                         blockUsers:{$elemMatch:{
//                             userId:data.senderId,
//                             isShow:true
//                         }}
//                     },
//                     {
//                         _id:data.senderId,
//                         blockUsers:{$elemMatch:{
//                             userId:data.receiverId,
//                             isShow:true
//
//                         }}
//                     }
//                     ]
//             };
//             Service.UserServices.getUser(criteria, {_id:1}, {lean:true}, function (err, res) {
//                 console.log("check.................block", err, res);
//                 if (err)
//                     cb(err);
//                 else {
//                     if (res.length) {
//                         callback();
//                     }
//                     else {
//                         cb();
//                     }
//                 }
//             })
//         },
//         checkChat:['checkBlock',function (cb) {
//             let criteria= {
//                 $or: [c1,c2]
//             };
//             Service.ChatServices.getChats(criteria, {_id:1}, {lean:true}, function (err, res) {
//                 console.log("check", err, res);
//                 if (err)
//                     cb(err);
//                 else {
//                     if (res.length > 0) {
//                         chatExist = 1;
//                         cb();
//                     }
//                     else cb()
//                 }
//             })
//         }],
//         checkSuggestion:['checkChat',function (cb) {
//             if(data.suggestionId){
//                 let criteria= {
//                    _id:data.suggestionId
//                 };
//                 Service.SuggestionServices.getSuggestion(criteria, {reply:1}, {lean:true}, function (err, res) {
//                     message.reply=res[0].reply
//                     cb()
//                 })
//             }
//             else cb()
//         }],
//         createChat: ['checkSuggestion', function (cb) {
//             if (chatExist === 0) {
//
//                 if(data.original && data.suggestionId){
//                    var msg = {
//                         senderId:data.senderId,
//                         imageUrl:{
//                            original:data.original,
//                            thumbnail:data.thumbnail
//                              },
//                         messageType:data.messageType,
//                         sentAt: +new Date(),
//                         message:data.message,
//                         reply:message.reply,
//                         postId:data.postId,
//                         postType:data.postType
//                     };
//                 }
//                 else if(data.original && !(data.suggestionId)){
//                     var msg = {
//
//                         senderId:data.senderId,
//                         imageUrl:{
//                             original:data.original,
//                             thumbnail:data.thumbnail
//                         },
//                         messageType:data.messageType,
//                         sentAt: +new Date(),
//                         message:data.message,
//                         postId:data.postId,
//                         postType:data.postType
//                     };
//                 }
//                 else {
//                     var msg = {
//                         senderId:data.senderId,
//                         message: data.message,
//                         messageType:data.messageType,
//                         sentAt: +new Date(),
//                     };
//                 }
//                 let dataToSet =
//                     {
//                         user1: data.senderId,
//                         chatCreateTime:+new Date(),
//                         user2: data.receiverId,
//                         messages: [msg]
//                     };
//                 Service.ChatServices.createChats(dataToSet, function (err, res) {
//                     saveChat=res;
//                     cb();
//                 })
//             }
//             else {
//                 let criteria = {
//                     $or: [c1,c2]
//                 };
//                 if(data.original && data.suggestionId){
//                     var dataToSet =
//                         {
//                             $push: {
//                                 messages: {
//                                     imageUrl:{
//                                         original:data.original,
//                                         thumbnail:data.thumbnail
//                                     },
//                                     senderId:data.senderId,
//                                     message: data.message,
//                                     messageType:data.messageType,
//                                     sentAt:+new Date(),
//                                     reply:message.reply,
//                                     postId:data.postId,
//                                     postType:data.postType
//                                 }
//                             },
//                             chatCreateTime:+new Date(),
//                             isDeleteUser1:false,
//                             isDeleteUser2 :false,
//                         }
//                 }
//                 else if(data.original && !data.suggestionId){
//
//                     var dataToSet =
//                         {
//                             $push: {
//                                 messages: {
//                                     imageUrl:{
//                                         original:data.original,
//                                         thumbnail:data.thumbnail
//                                     },
//                                     senderId:data.senderId,
//                                     message: data.message,
//                                     messageType:data.messageType,
//                                     sentAt:+new Date(),
//                                     postId:data.postId,
//                                     postType:data.postType
//                                 }
//                             },
//                             chatCreateTime:+new Date(),
//                             isDeleteUser1:false,
//                             isDeleteUser2 :false,
//                         }
//                 }
//                 else {
//                     var dataToSet =
//                         {
//                             $push: {
//                                 messages: {
//                                     senderId:data.senderId,
//                                     message: data.message,
//                                     messageType:data.messageType,
//                                     sentAt:+new Date(),
//                                 }
//                             },
//                             chatCreateTime:+new Date(),
//                             isDeleteUser1:false,
//                             isDeleteUser2 :false,
//                         };
//                 }
//                 Service.ChatServices.updateChats(criteria, dataToSet, {new:true}, function (err, res) {
//                     if (err)
//                         cb(err);
//                     else{
//                         saveChat=res;
//                         cb();
//                     }
//                 })
//             }
//         }],
//         sendSocketMessage: ['createChat', function (cb) {
//             let to = all[data.receiverId];
//
//             console.log('tooooooooooooooooo',to,message);
//             if(to){
//                 socket.to(to).emit("message",message);
//             }
//            /* else {
//                 getSocketIdFromDb(data.receiverId,function (err,res) {
//                     console.log('socket id from db',res)
//                     socket.to(res).emit("message",message);
//                 })
//             }*/
//                 let criteria = {
//                     $or: [c1,c2]
//                 };
//                 let populate = [
//                     {
//                         path: 'user1',
//                         match: {},
//                         select: {deviceToken:1,userName:1},
//                         options: {}
//                     },
//                     {
//                         path: 'user2',
//                         match: {},
//                         select: {deviceToken:1,userName:1},
//                         options: {}
//                     }
//                 ];
//                 Service.ChatServices.populateChats(criteria, {messages:0}, {lean: true}, populate, function (err, result) {
//                    if(result.length){
//                        if ((JSON.stringify(result[0].user1._id) === JSON.stringify(message.receiverId)) && result[0].muteByUser1 ===false) {
//                               let data={
//                                   type:'CHAT',
//                                   msg:name+' send you message',
//                                   chatId:saveChat._id,
//                                   userId:senderId
//                               };
//                               console.log('muteByUser1 ',data);
//                               NotificationManager.sendPushToUser(result[0].user1.deviceToken,data,function (err) {
//                                   cb()
//                               });
//
//                        }
//                        else if((JSON.stringify(result[0].user1._id) !== JSON.stringify(message.receiverId)) && result[0].muteByUser2 ===false){
//                                let data={
//                                    type:'CHAT',
//                                    msg:name+' send you message',
//                                    chatId:saveChat._id,
//                                    userId:senderId
//                                };
//                                NotificationManager.sendPushToUser(result[0].user2.deviceToken,data,function (err) {
//                                    cb()
//                                });
//                        }
//                    }
//                    else cb()
//                 })
//         }]
//     }, function (err) {
//         if (err) {
//             callback(err);
//         } else {
//             callback(null)
//         }
//     })
// };
//
// const verifyToken = function (accessToken, cb) {
//
//     let criteria = {
//         accessToken: accessToken,
//     };
//     let projection = {};
//     let option = {lean: true};
//     Service.UserServices.getUser(criteria, projection, option, function (err, result) {
//         if (err) {
//             cb()
//         } else {
//             if (result && result.length) {
//                 cb(null, {userData: result[0]})
//             } else {
//                 cb(null)
//             }
//         }
//     })
// };
//
// const getSocketIdFromDb = function (id, cb) {
//
//     let criteria = {
//         _id: id,
//     };
//     let projection = {socketId:1};
//     let option = {lean: true};
//     Service.UserServices.getUser(criteria, projection, option, function (err, result) {
//         if (result && result.length) {
//             cb(null,result[0].socketId)
//         } else {
//             cb(null)
//         }
//     })
// };

