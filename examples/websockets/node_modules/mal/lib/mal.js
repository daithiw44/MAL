var mongo = require('mongodb')
, JSONStream = require('JSONStream')
, util = require('util');

/*
 * Constructor
 * note takes time to authenticate against a database after opening.
 */
MAL = function(dbSettings, callback) {
  var server = new mongo.Server(dbSettings.host, dbSettings.port, dbSettings.options);
  var db = new mongo.Db(dbSettings.db, server, {safe:true});
  db.addListener('error', function(error) {
    util.puts('Error connecting to Mongo???', error);
  });
  db.open(function(err) {
    if (dbSettings.hasOwnProperty('username')) {
      db.authenticate(dbSettings.username, dbSettings.password, function(err) {
        if (err) {
          util.puts('Error Authentication', err);
        }
        _checkCallBack(callback, db);
      });
    } else {
      _checkCallBack(callback, db);
    }
  });
  this.db = db;
};

function _checkCallBack(callback,db) {
  util.puts('Connected to MongoDB');
  if (typeof callback === 'function') {
    callback(db);
  }
}

/**
 * getCollectionByName
 */
MAL.prototype.getCollectionByName = function(collection_name, callback) {
  this.db.collection(collection_name, function(error, user_collection) {
    if (error) callback(error);
    else callback(null, user_collection);
  });
};

/**
 * findOne
 */
MAL.prototype.findOne = function() {
  this.universalMethod('findOne',Array.prototype.slice.call(arguments));
};

/**
 * find
 */
MAL.prototype.find = function() {
  this.universalMethod('find',Array.prototype.slice.call(arguments));
};

/**
 * findAndModify
 */
MAL.prototype.findAndModify = function() {
  this.universalMethod('findAndModify',Array.prototype.slice.call(arguments));
};

/**
 * insert
 */
MAL.prototype.insert = function() {
  this.universalMethod('insert',Array.prototype.slice.call(arguments));
};

/**
 * save
 */
MAL.prototype.save = function() {
  this.universalMethod('save',Array.prototype.slice.call(arguments));
};

/**
 * update
 */
MAL.prototype.update = function() {
  this.universalMethod('update',Array.prototype.slice.call(arguments));
};

/**
 * remove
 */
MAL.prototype.remove = function() {
  this.universalMethod('remove',Array.prototype.slice.call(arguments));
};

/**
 * universalMethod
 * Most calls run through here could be called publically
 *
 * .universalMethod('insert',['test',{a:1}, {safe: false}]);
 *
 */
MAL.prototype.universalMethod = function (dbMethod,argsArray){
  var callback;
  if (typeof argsArray[argsArray.length-1] === 'function'){
    callback = argsArray[argsArray.length-1];
  }
  this.getCollectionByName(argsArray[0], function(error, collection) {
    if (error) {
      (typeof callback === 'function') ? callback(error) : util.puts('error: ', error);
    } else {
      argsArray.splice(0,1);
      collection[dbMethod].apply(collection,argsArray);
    }
  });
}

/**
 * streamPipe
 */
MAL.prototype.streamPipe = function() {
  var args = Array.prototype.slice.call(arguments);
  collectionName = args.splice(0,1)[0];
  wrStream = args.splice(args.length-1,1)[0];
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) util.puts('error: ', error);
    collection.find.apply(collection,args).stream().pipe(JSONStream.stringify()).pipe(wrStream);
  });
};

/**
 * streamEvents
 */
MAL.prototype.streamEvents = function() {
  var args = Array.prototype.slice.call(arguments);
  collectionName = args.splice(0,1)[0];
  xStream = args.splice(args.length-1,1)[0];
  this.getCollectionByName(collectionName, function(error, collection) {
    var readStream = collection.find.apply(collection,args).stream();
    readStream.on('data', function(data) {
      xStream.emit('data', data);
    });
    readStream.on('error', function(err) {
      xStream.emit('err', err);
    });
    readStream.on('end', function() {
      xStream.emit('end');
    });
  });
};

/*MAL.prototype.mapReduce = function(command,callback) {
  console.log('this: ', this.db.executeDbCommand);
  this.db.executeDbCommand(command, function(error, dbres) {
    if (error) {
    callback(error);
    }
    else {
    callback(null, dbres);
    }
  });
};*/

exports.MAL = MAL;
