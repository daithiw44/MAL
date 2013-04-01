MAL (Simple MongoDB Access Layer) v0.3.0
======================================


Convenience methods for accessing and connecting to, authenticating and querying against a MongoDB instance in Node.
--------------------------------------------------------------------------------------------

NOW USES NODE v0.10 and mongodb-1.2.14, to cater for process.nextTick see changelog.

MAL provides an easy way to preform operations on a MongoDB instance.
[mongodb / node-mongodb-native](https://github.com/mongodb/node-mongodb-native) -- `sits on mongodb / node-mongodb-native function calls`

	As a general rule function calls take the format of ('collectionname', ...>>> same rules for params as node-mongodb-native);
	*exceptions being the two streams calls where the last parameters are always the writebale stream for streamPipe 
		or readable stream for streamEvents.
	** no callback if none is desired but set {safe:false} etc.. same as node-mongodb-native.

0. npm
--------------------------------
npm install mal

var MAL = require('mal').MAL;

1. Create a dbSettings object
--------------------------------
	//example dbSettings Object.

	var dbsettings = {
		host: 'host ip or name',
		port: port number,
		db: 'database name',
		options: {auto_reconnect: true},
		username: '...',
		password: '...'
	};

	//username and password are required only if there is authentication, 
	//if there is no authentication required remove the properties from the object.

	var dbsettings = {
		host: 'host ip or name',
		port: port number,
		db: 'database name',
		options: {auto_reconnect: true}
	};

2. var dbManager = new MAL(dbsettings, optionalCallback);
----------------------------------------------------------------
	optionalCallback is a function that is takes an connected mongoDB server as a parameter.

	No CallBack required.
	----------------------

	var dbManager = new MAL(dbsettings);

	Callback required
	------------------

	//example

	function optionalCallback(db){
	  var callback = function(err, collection){
		collection.find({status:1}, {id:1..}).toArray(function(error, result) {
			if (error) {
			  console.log(err); 
			}
			else {
				//do something with result
			}
		});
	  }

	  db.collection('matches', function(error, collection) {
		if (error) callback(error);
		else callback(null, collection);
	  });
	}

	var dbManager = new MAL(dbsettings, optionalCallback);

	For another example see in test0.js in tests.

	`Obvious 'thing' is optionalCallBack doesn't use the MAL class but rather requires the user to get the collection ref 
	and then preform the method call using node-mongodb-native directly for both.`

3. Function calls
--------------------------------

	Function calls to the MAL instance follow the same pattern as node-mongodb-native the exception being 
	that all the first paramater is the name of the collection being queried.

	The first parameter is always the collection name, followed by parameters expected by node-mongodb-native

	example:
	
	//Assume
	var dbManager = new MAL(dbsettings);
	dbManager.find ('col1', {name : 'name'}, {_id:0}, function(err,result){...}); 
	
	//List of calls available in v0.2
	.find(collectionName, query, fields, options, callback)
	.findOne(collectionName, query, callback) 	
	.insert(collection_Name, query, options, callback) 
	.save = function(collectionName,obj, callback)
	.update = function(collectionName, criteria, update, options, callback) 
	.remove = function(collectionName, criteria, callback)
	.findAndModify = function(collection_Name, criteria, sort, update, options, callback)
	// for Stream methods last parameters must be the writable or readable streams.
	.streamPipe = function(collectionName, query, fields, options, wrStream)
	.streamEvents = function(collectionName, query, fields, options, xStream)

4. Streaming Functionality.
--------------------------------
	
	MAL provides two streaming methods. (see examples).
	
	//Assume
	var dbManager = new MAL(dbsettings);

	 a) streamPipe. (see stream in examples)
	 	//function(collectionName, query, fields, options, wrStream) {...
		// the first argument is always a collectionName
		// the last
	 	dbManager.streamPipe('col1',stream);
		//this calll will return everything from 'col1' 
		//and pipe the results to wrStream where wrStream is a writable stream like response or a tcp socket.

	 b) streamEvents.( see sse in examples);
	 	//lets say we are streaming to serversent events.
		//pass http response object as stream, or store the response object and pass in the stores response
		dbManager.streamEvents('Col1',res);
		res.writeHead(200, {
		  'Content-Type': 'text/event-stream',
		  'Cache-Control': 'no-cache',
		  'Connection': 'keep-alive'
		});
		//flush headers
		res.write('');
	c) stream to websockets with .streamPipe
		see websockets in examples using shoe and browserify.

see 'server sent events' example on [cloudfoundry nodejs using a mongolab mongoDB instance](http://mongodbstreamdemo.cloudfoundry.com/)
streaming 4.8mb of tweets to the browser with Server Sent Events.

To populated data, pulled tweets from a twitter account that has volume tweets and stuck them in a mongoDB at mongolab.

5. ToDo.
--------------------------------

	1. Write more tests
	2. Write examples
	3. Add mapReduce and other calls
	4. Take it from there.

6. Changelog.
--------------------------------

	1. Node server may be up before DBConnection, depending on how MAL is used. MAL will now buffer the db requests while the connection is being established and execut them once the connection is live.
	2. Node changes to streams in v0.10, streams for server sent events are piped and v0.3.0 requires node v0.10.
