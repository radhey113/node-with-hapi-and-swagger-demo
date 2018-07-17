'use strict';


var Models = require('../Models');

/*********************Radhey Queries*****************/
let findAndStore = (Model, criteria, dataToSave, options)=>{
    return Model.findOneAndUpdate(criteria, dataToSave, options);
};

/*******************************************************/
let insertMany = (Model, data) => {
    return Model.insertMany(data);
};


/*********************Radhey Queries*****************/
let updateDocument = (Model, criteria, dataToSave, options)=>{
    return Model.update(criteria, dataToSave, options);
};

/**** find datamode from model *****/
let getOneDocumemt = (Model, criteria, projection, options) => {
  return Model.findOne(criteria, projection, options);
};

/** save data in model **/
let saveDocument = function(Model,data){
    return new Model(data).save();
};


/** Find all document **/
let getAllDocument = (Model, criteria, projection, options) => {
    return Model.find(criteria, projection, options);
};

/** Get all document with population **/
let getPopulatedData = ( Model, criteria, projection, options, populatedKey) => {
    return Model.find(criteria, projection, options).populate(populatedKey);
};

/* Get post comments*/
let getUserPostComments = (Models, criteria)=>{
    return Models.aggregate([criteria]);
};

/*** Made by rohit, using some modules **/
let getData = function (model, query, projection, options, callback) {
    model.find(query, projection, options, (err, data)=> {
        if (err) return callback(err);
        else return callback(null, data);
    });
};

/*** Delete document from data model **/
let deleteData = (Model, criteria) => {
    return Model.remove(criteria);
};


/** Document count **/
let countDoc = (Model, criteria) => {
    return Model.count(criteria);
};



/*******************************************************/
let saveData = function(model,data,callback){
    new model(data).save( (err,result)=>{
        if(err) return callback(err);
        callback(null,result);
    })
};


let getUniqueData = function (model,query, projection, options,keyName, callback) {

    model.find(query, projection, options).distinct(keyName, (err, data)=> {
        if (err) return callback(err);
        else return callback(null, data);
    });
};

let findOne = function (model, query, projection, options, callback) {
    model.findOne(query, projection, options, function (err, data) {
        if (err) return callback(err);
        return callback(null, data);
    });
};

let findAndUpdate = function (model, conditions, update, options, callback) {
    model.findOneAndUpdate(conditions, update, options, function (error, result) {
        if (error) {
            return callback(error);
        }
        return callback(null, result);
    })
};

let update = function (model, conditions, update, options, callback) {
    model.update(conditions, update, options, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);

    });
};

let remove = function (model, condition, callback) {
    model.remove(condition, function (err, result) {
        if (err) {
            return callback(err);
        }
        else callback(null, result);
    });
};
/*------------------------------------------------------------------------
 * FIND WITH REFERENCE
 * -----------------------------------------------------------------------*/
let populateData = function (model, query, projection, options, collectionOptions, callback) {
    model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {
        if (err) return callback(err);
        return callback(null, data);
    });
};

let count = function (model, condition, callback) {
    model.count(condition, function (error, count) {
        if (error) return callback(error);
        return callback(null, count);
    })
};
/*
 ----------------------------------------
 AGGREGATE DATA
 ----------------------------------------
 */
let aggregateData = function (model, group, callback) {
    model.aggregate(group, function (err, data) {

        if (err) return callback(err);
        return callback(null, data);
    });
};

let insert = function(model, data, options, callback){
    model.collection.insert(data,options, function(err,result){
        if(err) callback(err);
        else callback(null,result);
    })
};

let aggregateDataWithPopulate = function (model, group, populateOptions, callback) {
    model.aggregate(group, (err, data) => {

        if (err) {
            //logger.error("Aggregate Data", err);
            return callback(err);
        }

        model.populate(data, populateOptions,
            function (err, populatedDocs) {

                if (err) return callback(err);
                return callback(null, populatedDocs);// This object should now be populated accordingly.
            });
//return callback(null, data);
    });
};

let deepPopulate= function(model, criteria, projectionQuery, options, populateModel, nestedModel, callback)
{
    model.find(criteria, projectionQuery, options).populate(populateModel)
        .exec(function (err, docs) {
            if (err) return callback(err);

            model.populate(docs, nestedModel,
                function (err, populatedDocs) {
                    if (err) return callback(err);
                    callback(null, populatedDocs);// This object should now be populated accordingly.
                });
        });
};

let bulkFindAndUpdate= function(bulk,query,update,options)
{
    bulk.find(query).upsert().update(update,options);
};


module.exports = {
    saveData : saveData,
    saveDocument: saveDocument,
    findAndStore : findAndStore,
    getOneDocumemt: getOneDocumemt,
    getData : getData,
    deleteData: deleteData,
    getPopulatedData: getPopulatedData,
    getUniqueData : getUniqueData,
    update : update,
    remove: remove,
    insert: insert,
    count: count,
    findOne: findOne,
    findAndUpdate : findAndUpdate,
    getAllDocument:getAllDocument,
    insertMany: insertMany,
    updateDocument: updateDocument,
    getUserPostComments: getUserPostComments,
    populateData : populateData,
    aggregateData : aggregateData,
    aggregateDataWithPopulate: aggregateDataWithPopulate,
    deepPopulate: deepPopulate,
    bulkFindAndUpdate : bulkFindAndUpdate,
    countDoc: countDoc
};