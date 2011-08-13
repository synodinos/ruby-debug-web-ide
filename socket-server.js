// Setup Express and Socket.io
var express = require('express')
        , app = express.createServer()
        , io = require('socket.io').listen(app);

// Configure Express
app.configure(function() {
  // Server static files from /public
  app.use(express.static(__dirname + '/public'));
});

// Start server
app.listen(8888);

//PID of ruby-debug-ide
var rdipid = 0;

// Handle main socket
io.sockets.on('connection', function (socket) {

  // Send the names for all available ruby files
  var rubyfiles = [];
  var fs = require('fs');
  fs.readdir('./public/ruby/', function (err, files) {
    if (err) throw err;
    files.forEach(function (file) {
      rubyfiles.push(file);
    });
    console.log(rubyfiles);
    socket.emit('ruby_files', rubyfiles);
  });

  // Spawn the debugger (rdebug-ide) child process
  socket.on('spawn', function (data) {
    var connected = false;
    var frameData = "";
    console.log(data);
    var util = require('util')
            , cmd = 'rdebug-ide'
            , script = data.script
            , bline = data.bline
            , options = ['-p','1234', '-d', 'public/ruby/' + script]
            , spawn = require('child_process').spawn
            , rdi = spawn(cmd, options);

    // Keep the debugger's pid so we can use it to terminate it afterwards
    rdipid = rdi.pid;

    rdi.stdout.on('data', function (data) {
      console.log('rdebug-ide stdout: ' + data);
    });

    rdi.stderr.on('data', function (data) {
      // As soon as the debugger server is up, connect via telnet
      if (!connected) {
        var conn = dconn(function() {
          console.log('------ Entered dconn() callback ------');
          connected = true;
          console.log('------ cmd 1 ------');
          //this.write('b public/ruby/test3.rb:25\r\n');
          console.log('script='+script+' bline='+bline);
          this.write('b public/ruby/' + script + ':' + bline + '\r\n');
          console.log('------ cmd 2 ------');
          this.write('start\r\n');
          console.log('------ cmd 3 ------');
          this.write('var local\r\n');
          console.log('------ Exiting dconn callback ------');
        });
      } else {
        var dataStr = data.toString();
        if (!dataStr.indexOf("<variable")) {
          console.log(dataStr);
          frameData += dataStr;
          if (dataStr.indexOf("</variables>") >= 0) {
            console.log('about to enter sendFrameData()');
            sendFrameData(frameData, socket);
          }
        }
      }
    });

    rdi.on('exit', function (code) {
      console.log('rdebug-ide exited with code ' + code);
    });
  });
});

/**
 * Connects to the debugger over TCP and passes the connection to the supplied callback
 *
 * @param cb
 */
var dconn = function(cb) {
  console.log('Entered dcon');
  var net = require('net');
  var conn = net.createConnection(1234, 'localhost');
  conn.on('connect', function() {
    console.log('connected to rdebug-ide via telnet on port 1234');
    cb.call(conn);
  })
};

/**
 * Gets the frame data as a string, parses it as XML and constructs the JSON response
 *
 * @param frameDataXML
 */
var sendFrameData = function (frameDataXML, socket) {
  console.log('Inside sendFrameData()');
  var frame = [];
  frameDataXML = '<?xml version="1.0" encoding="UTF-8"?>' + "\n" + frameDataXML;
  console.log(frameDataXML);
  var libxmljs = require("libxmljs");
  var xmlDoc = libxmljs.parseXmlString(frameDataXML);
  var vars = xmlDoc.root().childNodes();
  console.log(vars[1].name());
  vars.forEach(function(v) {
    if (v.name() == "variable") {
      var name = v.attr('name').value();
      if (v.attr('value')) {
        var val = v.attr('value').value();
        console.log('Value = ' + val);
      }
      if (v.attr('type')) {
        var type = v.attr('type').value();
        console.log('Type = ' + type);
      }
      frame.push([name, val, type]);
    }
  });

  // Send the data to the client (JSON over socket)
  // console.log(frame);
  socket.emit('frame', frame);

  // Terminate debugger process
  console.log('Killing debug-session...' + Math.random());
  if (rdipid) {
    process.kill(rdipid, 'SIGHUP');
  }
};



