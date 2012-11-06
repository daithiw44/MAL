var stream = require('stream')
, fs = require('fs')
, MAL = require('../../lib/mal').MAL
, http = require('http');

// settings object (username and password are not compulsory, remove from object if not required)
var dbsettings = {
  host: '>>>>> HOST <<<<<<<'
  ,port: 1234567
  ,db: '>>>> DB <<<<<<'
  , options: {auto_reconnect: true}
  ,username: '',
  ,password: ''
};

var dbManager = new MAL(dbsettings, '');

var server = http.createServer(function(req, res) {
  if (req.url === '/') {
    console.log('here');
    fileName = 'index.html';
    var out = fs.createReadStream(fileName);
    out.pipe(res);
  } else if (req.url === '/stream') {
    var dbStream = new stream.Stream();
    dbStream.readable = true;
    //Insert Collection here.
    dbManager.streamEvents('>>>>>>Collection Name <<<<<<', {},{},{},dbStream);
    var start = Date.now();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    //flush headers
    res.write('');
    dbStream.on('data', function(data) {
      res.write('data: ' + JSON.stringify(data) + '\r\n\r\n');
    });
    dbStream.on('end', function() {
      console.log('ended');
      var duration = Date.now() - start;
      console.log(duration);
    });
  }
});

server.listen(5000);
