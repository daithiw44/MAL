var net = require('net')
, MAL = require('../../lib/mal').MAL;

// settings object (username and password are not compulsory)
var dbsettings = {
	  host: '',
	  port: 11111,
	  db: '',
    options: {auto_reconnect: true},
	  username: '',
	  password: ''
};

var dbManager = new MAL(dbsettings, '');
net.createServer(function(socket){
  socket.on('connect', function(){
    dbManager.streamPipe('col1',{},{},{},socket);
  });
}).listen(6000);
