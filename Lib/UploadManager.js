
'use strict';
var Config = require('../Config');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');
var Path = require('path');
var knox = require('knox');
var fsExtra = require('fs-extra');


var baseFolder = Config.awsS3Config.s3BucketCredentials.folder.profilePicture + '/';
var baseURL = Config.awsS3Config.s3BucketCredentials.s3URL + '/' + baseFolder;

function uploadFileToS3WithThumbnail(fileData, userId, callbackParent) {

    console.log('innn upload function')
    //Verify File Data
    var profilePicURL = {
        original: null,
        thumbnail: null
    };
    var originalPath = null;
    var thumbnailPath = null;
    var dataToUpload = [];

    async.series([
        function (cb) {
            //Validate fileData && userId
            if (!userId || !fileData || !fileData.filename) {
                console.log('in upload file to s3',userId,fileData)
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            } else {
                // TODO Validate file extensions
                cb();
            }
        }, function (cb) {
            //Set File Names
            profilePicURL.original = UniversalFunctions.getFileNameWithUserId(false, fileData.filename, userId);
            profilePicURL.thumbnail = UniversalFunctions.getFileNameWithUserId(true, fileData.filename, userId);
            console.log("profilePicirl,,,,,,,",profilePicURL)
            cb();
        },
        function (cb) {
            //Save File
            var path = Path.resolve(".") + "/uploads/" + profilePicURL.original;
            saveFile(fileData.path, path, function (err, data) {
                cb(err, data)
            })
        },
        function (cb) {
            //Create Thumbnail
            originalPath = Path.resolve(".") + "/uploads/" + profilePicURL.original;
            thumbnailPath = Path.resolve(".") + "/uploads/" + profilePicURL.thumbnail;
            console.log(originalPath,"sssssssssssssssssssssss")
            createThumbnailImage(originalPath, thumbnailPath, function (err, data) {
                dataToUpload.push({
                    originalPath: originalPath,
                    nameToSave: profilePicURL.original
                });
                dataToUpload.push({
                    originalPath: thumbnailPath,
                    nameToSave: profilePicURL.thumbnail
                });
                console.log("...........",dataToUpload)
                cb(err, data)
            })
        },
        function (cb) {
            //Upload both images on S3
            parallelUploadTOS3(dataToUpload, cb);
            // parallelUploadTOGoogleCloud(dataToUpload, cb);
        }
    ], function (err, result) {
        callbackParent(err, profilePicURL)
    });
}

function uploadFile(fileData, userId, type, callbackParent) {
    //Verify File Data
    var imageURL = {
        original: null,
        thumbnail: null
    };
    var logoURL = {
        original: null,
        thumbnail: null
    };
    var documentURL = null;
    var originalPath = null;
    var thumbnailPath = null;
    var dataToUpload = [];

    async.series([
        function (cb) {
            //Validate fileData && userId
            if (!userId || !fileData || !fileData.filename) {
                console.log('in upload file to s3',userId,fileData)
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            } else {
                // TODO Validate file extensions
                cb();
            }
        }, function (cb) {
            //Set File Names
            imageURL.original = UniversalFunctions.getFileNameWithUserIdWithCustomPrefix(false, fileData.filename, type,  userId);
            imageURL.thumbnail = UniversalFunctions.getFileNameWithUserIdWithCustomPrefix(true, fileData.filename, type, userId);
            cb();
        },
        function (cb) {
            //Save File
            var path = Path.resolve(".") + "/uploads/" + imageURL.original;
            saveFile(fileData.path, path, function (err, data) {
                cb(err, data)
            })
        },
        function (cb) {
            //Create Thumbnail if its a logo
            originalPath = Path.resolve(".") + "/uploads/" + imageURL.original;
            dataToUpload.push({
                originalPath: originalPath,
                nameToSave: imageURL.original
            });
            if (type == UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.LOGO){
                thumbnailPath = Path.resolve(".") + "/uploads/" + imageURL.thumbnail;
                createThumbnailImage(originalPath, thumbnailPath, function (err, data) {
                    dataToUpload.push({
                        originalPath: thumbnailPath,
                        nameToSave: imageURL.thumbnail
                    });
                    cb(err, data)
                })
            }else {
                cb();
            }

        },
        function (cb) {
            //Upload both images on S3
            parallelUploadTOS3(dataToUpload, cb);
        }
    ], function (err, result) {
        callbackParent(err, imageURL)
    });
}


function parallelUploadTOS3(filesArray, callback) {
    //Create S3 Client
    var client = knox.createClient({
        key: Config.awsS3Config.s3BucketCredentials.accessKeyId
        , secret: Config.awsS3Config.s3BucketCredentials.secretAccessKey
        , bucket: Config.awsS3Config.s3BucketCredentials.bucket
    });
    var s3ClientOptions = {'x-amz-acl': 'public-read'};
    var taskToUploadInParallel = [];
    filesArray.forEach(function (fileData) {
        taskToUploadInParallel.push((function (fileData) {
            return function (internalCB) {
                if (!fileData.originalPath || !fileData.nameToSave) {
                    internalCB(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                } else {
                    client.putFile(fileData.originalPath, fileData.nameToSave, s3ClientOptions, function (err, result) {
                        deleteFile(fileData.originalPath);
                        internalCB(err, result);
                    })
                }
            }
        })(fileData))
    });

    async.parallel(taskToUploadInParallel, callback)
}

function saveFile(fileData, path, callback) {
    fsExtra.copy(fileData, path, callback);
}

function deleteFile(path) {
    fsExtra.remove(path, function (err) {
        console.log('error deleting file>>',err)
    });
}

function createThumbnailImage(originalPath, thumbnailPath, callback) {
    console.log('in yhumn',originalPath,thumbnailPath)
    var gm = require('gm').subClass({imageMagick: true});
    gm(originalPath)
        .resize(Config.APP_CONSTANTS.SERVER.THUMB_WIDTH, Config.APP_CONSTANTS.SERVER.THUMB_HEIGHT, "!")
        .autoOrient()
        .write(thumbnailPath, function (err, data) {
            callback(err)
        })
}

function uploadVideo(fileData, userId, callbackParent) {
    var videoUrl = {};
    var dataToUpload = [];
    async.series([
        function (cb) {
            //Validate fileData && userId
            if (!userId || !fileData || !fileData.filename) {
                console.log('in upload file to s3', userId, fileData)
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            } else {
                // TODO Validate file extensions
                cb();
            }
        }, function (cb) {
            //Set File Names
            videoUrl.original = UniversalFunctions.getFileNameWithUserIdForVideo(fileData.filename, userId);

            cb();
        },
        function (cb) {
            //Save File
            console.log("****ssdsdsdds**********",videoUrl);
            var path = Path.resolve(".") + "/uploads/" + videoUrl.original;
            console.log("********path***************",path);
            dataToUpload.push({
                originalPath: path,
                nameToSave: videoUrl.original
            });
            saveFile(fileData.path, path, function (err, data) {
                cb(err, data)
            })
        },
        function (cb) {
            console.log("***********dataToUpload***********",dataToUpload);
            parallelVideoUploadTOS3(dataToUpload, cb);

        },
        function (cb) {
            createVideoThumb(dataToUpload,function (err,res) {
                videoUrl.thumbnail=res
                cb()
            })
        }
    ], function (err, result) {
        console.log(",,,,,,,,,,videoUrl,,,,,,,,", videoUrl);
        callbackParent(err, videoUrl)
    });
};

function createVideoThumb(filesArray, callback) {
    var client = knox.createClient({
        key: Config.awsS3Config.s3BucketCredentials.accessKeyId
        , secret: Config.awsS3Config.s3BucketCredentials.secretAccessKey
        , bucket: Config.awsS3Config.s3BucketCredentials.bucket
    });
    let output=new Date().getTime()
    Thumbler({
        type: 'video',
        input: filesArray[0].originalPath,
        output: './videoThumb/'+'thumb'+output+'.jpeg',
        time: '00:00:02',
        size: '400x400' // this optional if null will use the desimention of the video
    }, function(err, path){
        console.log("FDdfd",path)
        if (err) {
            return err;
        }else{
            var s3ClientOptions = {'x-amz-acl': 'public-read'};
            client.putFile( './videoThumb/'+'thumb'+output+'.jpeg', 'thumb'+output+'.jpeg', s3ClientOptions, function (err, result) {
                deleteFile( './videoThumb/'+'thumb'+output+'.jpeg');
                callback(err, 'thumb'+output+'.jpeg');
            });
        }
        //return path;
    });
}
function parallelVideoUploadTOS3(filesArray, callback) {
    //Create S3 Client
    console.log("*********filesArray*******",filesArray);
    var client = knox.createClient({
        key: Config.awsS3Config.s3BucketCredentials.accessKeyId
        , secret: Config.awsS3Config.s3BucketCredentials.secretAccessKey
        , bucket: Config.awsS3Config.s3BucketCredentials.bucket
    });


    var s3ClientOptions = {'x-amz-acl': 'public-read'};
    client.putFile(filesArray[0].originalPath, filesArray[0].nameToSave, s3ClientOptions, function (err, result) {
        deleteFile(filesArray[0].originalPath);
        callback(err, result);
    });
}
module.exports = {
    uploadFileToS3WithThumbnail: uploadFileToS3WithThumbnail,
    uploadFile: uploadFile,
    uploadVideo:uploadVideo,
    createThumbnailImage:createThumbnailImage
};
