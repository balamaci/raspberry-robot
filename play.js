(function () {
    "use strict";

    var express = require('express'),
        path = require('path'),
        app = express(),
        http = require('http').createServer(app),
        serialport = require("serialport"),
        SerialPort  = serialport.SerialPort,
        Delivery  = require('delivery'),
        io = require('socket.io').listen(http),

        pathActions = require('./path_actions'),
        camera = require('./camera'),
        Commons = require('./commons');

    var clientSocket,
        baseSpeed = 180,
        delivery,
        serialFeedback;

    var arduinoSerial = new SerialPort("/dev/ttyACM0", {
        baudrate: 19200,
        parser: serialport.parsers.readline("\n")
    });

    arduinoSerial.open(function () {
        console.log('open');
        arduinoSerial.on('data', function(data) {
            serialFeedback = data.trim();
            if(serialFeedback === 'Stopped engines') {
                if(pathActions.actions) {
                    pathActions.executeNextPathAction(motorCommand);
                    clientSocket.emit('executing', { action : pathActions.lastExecutedPathAction });
                }
            }
            console.log('data received: "' + serialFeedback + '"');
        });
    });


    app.use(express.static(path.join(__dirname, 'static')));

    var html_dir = './static/';

    // routes to serve the static HTML files
    app.get('/', function(req, res) {
        res.sendfile(html_dir + 'index.html');
    });

    var handleSerialResponse = function(err, results) {
        console.log('err ' + err);
        console.log('handling results ' + results);
    };

    function motorCommand(command, data) {
        console.log('Data ' + JSON.stringify(data));
        command += getArduinoSpeed(data.val);
        if(data.timeMs) {
            command += '_' + data.timeMs;
        }
        command += "\n";

        console.log('Command ' + command);

        arduinoSerial.write(command, handleSerialResponse);
    }

    // listen for new socket.io connections:
    io.sockets.on('connection', function (socket) {
        console.log('Connected');
        clientSocket = socket;
        delivery = Delivery.listen(clientSocket);

        socket.on('lengine', function (data) {
            motorCommand(Commons.LEFT_ENGINE_ON, data);
        });

        socket.on('rengine', function (data) {
            motorCommand(Commons.RIGHT_ENGINE_ON, data);
        });

        socket.on('all_engine', function (data) {
            motorCommand(Commons.ALL_ENGINES_ON, data);
        });

        socket.on('rev_all_engine', function (data) {
            motorCommand(Commons.REV_ALL_ENGINES_ON, data);
        });

        socket.on('exec_actions', function (data) {
            pathActions.actions = JSON.parse(data.actions);
            console.log('ReverseEngine: ' + pathActions.actions);
            pathActions.poz = 0;

            var command = 'stop\n';
            arduinoSerial.write(command, handleSerialResponse);
        });


        socket.on('watch', function (data) {
            console.log('*** WATCHING ***');
            camera.startCapture();
        });
        socket.on('unwatch', function (data) {
            console.log('*** UNWATCHING ***');
            camera.stopCapture();
        });

        delivery.on('send.success', function(file) {
            console.log('Delivered ' + file);
            camera.delivering = false;
        });

    });

    io.sockets.on('disconnect', function() {
        console.log('DISConnected');
        camera.stopCapture();
    });


    function getArduinoSpeed(speedGear) {
        var speed = baseSpeed;

        if(speedGear) {
            speed += speedGear * 10;
        }
        return speed;
    }

    http.listen(8000);
})();