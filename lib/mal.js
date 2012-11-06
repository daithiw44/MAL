var Db = require('mongodb').Db
, ObjectID = require('mongodb').ObjectID
, Server = require('mongodb').Server
, mongo = require('mongodb')
, JSONStream = require('JSONStream')
, util = require('util');

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

MAL.prototype.getCollectionByName = function(collection_name, callback) {
  this.db.collection(collection_name, function(error, user_collection) {
    if (error) callback(error);
    else callback(null, user_collection);
  });
};

MAL.prototype.findOne = function(collectionName, query, callback) {
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.findOne(query, function(error, result) {
        if (error) callback(error);
        else callback(null, result);
      });
    }
  });
};

MAL.prototype.find = function(collectionName, query, fields, options, callback) {
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.find(query, fields, options).toArray(function(error, result) {
        if (error) callback(error);
        else callback(null, result);
      });
    }
  });
};

MAL.prototype.insert = function(collection_Name, query, options, callback) {
  this.getCollectionByName(collection_Name, function(error, collection) {
    if (error) {
      if (typeof callback === 'function') {
        callback(error);
      } else {
        util.puts('error: ', error);
      }
    }else {
      collection.insert(query, options, function(error,result) {
        if (typeof callback === 'function') {
          if (error){
            callback(error)
          } else {
            callback(null, result);
          }
        }
      });
    }
  });
};

MAL.prototype.save = function(collectionName,obj, callback) {
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) {callback(error)}
    else {
      collection.save(obj, function(error,result) {
        if (typeof callback === 'function') {
          if (error){
            callback(error)
          } else {
            callback(null, result);
          }
        }
      });
    }
  });
};

MAL.prototype.update = function(collectionName, criteria, update, options, callback) {
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) {console.log(error)}
    else {
      collection.update(criteria, update, options,function(error,result) {
        if (typeof callback === 'function') {
          if (error){
            callback(error)
          } else {
            callback(null, result);
          }
        }
      });
    }
  });
};

MAL.prototype.remove = function(collectionName, criteria,options, callback) {
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
    collection.remove(criteria, options, function(error, result) {
        if (typeof callback === 'function') {
          if (error){
            callback(error)
          } else {
            callback(null, result);
          }
        }
      });
    }
  });
};

MAL.prototype.findAndModify = function(collection_Name, criteria, sort, update, options, callback) {
  this.getCollectionByName(collection_Name, function(error, user_collection) {
    if (error) {callback(error)}
    else {
      user_collection.findAndModify(criteria, sort, updateObj, update, options,
      function(error,result) {
        if (error) {
          callback(error);
        }
        else callback(null, result);
      });
    }
  });
};

MAL.prototype.streamPipe = function(collectionName, query, fields, options, wrStream) {
  this.getCollectionByName(collectionName, function(error, collection) {
    collection.find(query, fields, options).stream().pipe(JSONStream.stringify()).pipe(wrStream);
  });
};

MAL.prototype.streamEvents = function(collectionName, query, fields, options, xStream) {
  this.getCollectionByName(collectionName, function(error, collection) {
    var readStream = collection.find(query, fields, options).stream();
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
