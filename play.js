(function () {
    "use strict";
    var express = require('express'),
        path = require('path'),
        app = express(),
        http = require('http').createServer(app),
        serialport = require("serialport"),
        SerialPort  = serialport.SerialPort,
        io = require('socket.io').listen(http);

    var arduinoSerial = new SerialPort("/dev/ttyACM0", {
        baudrate: 9600
    });

    arduinoSerial.open(function () {
        console.log('open');
        arduinoSerial.on('data', function(data) {
            console.log('data received: ' + data);
        });
        arduinoSerial.write("a", function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    });

    app.use(express.static(path.join(__dirname, 'static')));

    var html_dir = './static/';

    // routes to serve the static HTML files
    app.get('/', function(req, res) {
        res.sendfile(html_dir + 'index.html');
    });

    // listen for new socket.io connections:
    io.sockets.on('connection', function (socket) {
        console.log('Connected');

        socket.on('lengine', function (data) {
            console.log(data.val);
            if(data.val === 50) {
                arduinoSerial.write("a", function(err, results) {
                    console.log('err ' + err);
                    console.log('results ' + results);
                });
            }
        });
    });

    http.listen(8000);
})();