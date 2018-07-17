
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Config = require('../Config');

let AppVersions = new Schema({
    latestIOSVersion : {type: String, required:true},
    latestAndroidVersion : {type: String, required:true},
    criticalAndroidVersion : {type: String, required:true},
    criticalIOSVersion : {type: String, required:true},
    appType : {type :String},
    timeStamp: {type: Date, default: Date.now}
});


module.exports = mongoose.model('AppVersions', AppVersions);