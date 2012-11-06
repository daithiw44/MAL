MAL (Simple MongoDB Access Layer)
==================================


Convience methods for access a connecting to, authenticating and querying against a MongoDB.
--------------------------------------------------------------------------------------------

MAL provides an easy way to preform operations on a MongoDB instance.
[mongodb / node-mongodb-native](https://github.com/mongodb/node-mongodb-native) -- `sits on mongodb / node-mongodb-native function calls`
Where function calls take the format of ('collectionname', query parameters,..,...., callback);

To create and instance of MAL

1. Create a dbSettings object
--------------------------------
example: 

var dbsettings = {
	host: 'host ip or name',
	port: port number,
	db: 'database name',
	options: {auto_reconnect: true},
	username: '...',
	password: '...'
};

* username and password are required only if there is authentication, if there is no authentication required remove the properties from the object.

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

	example:

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

	*** Obvious 'thing' with 0.1 is optionalCallBack doesn't use the MAL class but rather requires the user to a) get the collection ref and then preform the method.

3. Function calls
--------------------------------

	Function calls to the MAL instance follow the same pattern as node-mongodb-native the exception being that all parameters are expected in the call and if they are not required empty objects must be passed in their place.

	The first parameter is always the collection name. follows by parameters expected by node-mongodb-native

	example. find
	
	//Assume
	var dbManager = new MAL(dbsettings);


	dbManager.find ('col1', {name : 'name'}, {_id:0}, {}, function(err,result){...}); 
	//note how options isn't required but we still have to pass it in as an empty object.

4. Streaming Functionality.
--------------------------------
	
	MAL provides two streaming functions. (see examples).
	
	//Assume
	var dbManager = new MAL(dbsettings);

	 a) streamPipe.
	 	//function(collectionName, query, fields, options, wrStream) {...

	 	dbManager.streamPipe('col1',{},{},{},stream);
		//this will return everything from 'col1' and pipe the results to wrStream where wrStream is a writable stream like response or a tcp socket.

	 b) streamEvents.
	 	//lets say we are streaming to serversent events.
		//create a readable stream
		var dbStream = new stream.Stream();
		dbStream.readable = true;
		//pass it into the streamEvents function
		dbManager.streamEvents('Col1', {},{},{},dbStream);
		res.writeHead(200, {
		  'Content-Type': 'text/event-stream',
		  'Cache-Control': 'no-cache',
		  'Connection': 'keep-alive'
		});
		//flush headers
		res.write('');
		//and listen on events
		dbStream.on('data', function(data) {
		  res.write('data: ' + JSON.stringify(data) + '\r\n\r\n');
		});
		dbStream.on('end', function() {
		  console.log('ended');
		});

5. ToDo.
--------------------------------

	1. Write new tests I've just tidied up something I've been using in a few places so need to be fully tested again
	2. Look at cleaning up function calls
	3. Add mapReduce and other calls
	4. Take it from there.
	 	






