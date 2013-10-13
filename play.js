(function () {
    "use strict";
    var express = require('express'),
        path = require('path'),
        app = express(),
        http = require('http').createServer(app),
        serialport = require("serialport"),
        SerialPort  = serialport.SerialPort,
        Delivery  = require('delivery'),
        io = require('socket.io').listen(http);

    var deliveryList = [],
        captureInterval = 5000, //ms
        isWatching = false;

    var arduinoSerial = new SerialPort("/dev/ttyACM0", {
        baudrate: 9600
    });

    arduinoSerial.open(function () {
        console.log('open');
        arduinoSerial.on('data', function(data) {
            console.log('data received: ' + data);
        });
/*
        arduinoSerial.write("a", function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
*/
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
            var command = "leng"+ data.val + "*";
            console.log('LeftEngine ' + command);

            arduinoSerial.write(command, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
        });

        socket.on('rengine', function (data) {
            var command = "reng" + data.val + "*";
            console.log('RightEngine: ' + command);

            arduinoSerial.write(command, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
        });

        socket.on('all_engine', function (data) {
            var command = "all_eng" + data.val + "*";
            console.log('AllEngine: ' + command);

            arduinoSerial.write(command, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
        });

        socket.on('rev_all_engine', function (data) {
            var command = "rev_all_eng"+ data.val + "*";
            console.log('ReverseEngine: ' + command);

            arduinoSerial.write(command, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
        });

        socket.on('watch', function (data) {
            var delivery = Delivery.listen(socket);
            that.deliveryList.push(delivery);
        });
    });

    io.sockets.on('disconnect', function() {
        console.log('DISConnected');
        that.deliveryList.forEach(function(delivery) {
            if (delivery.socket.id == socket.id) {
                var i = that.deliveryList.indexOf(delivery);
                that.deliveryList.splice(i,1);
            }
        });
    });

    function capture() {
        if (that.app.get('clients').length > 0) {
            var filename = '/tmp/' + item._id + '.jpeg';
            that.streamer(item.input, filename, that.webcamResolution, function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    that.deliveryList.forEach(function(delivery) {
                        delivery.send({
                            name: item._id + '.jpg',
                            path : filename
                        });
                    });
                }
            });
        }
    }

    var intervalId = setInterval(capture, parseInt(captureInterval) * 1000);


    http.listen(8000);
})();