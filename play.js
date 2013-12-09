(function () {
    "use strict";
    var express = require('express'),
        path = require('path'),
        app = express(),
        http = require('http').createServer(app),
        SerialPort  = require("serialport").SerialPort,
        Delivery  = require('delivery'),
        ChildProcess  = require('child_process'),
        watcher = require('chokidar'),
        fs  = require('fs'),
        io = require('socket.io').listen(http);

    var clientSocket,
        isWatching = false,
        baseSpeed = 180,
        lastCaptureId = 1,
        lastToDelete = 1,
        delivery,
        delivering,
        deleteIntervalId,
        cameraExec,
        actions;

    var arduinoSerial = new SerialPort("/dev/ttyACM0", {
        baudrate: 4800
    });

    arduinoSerial.open(function () {
        console.log('open');
        arduinoSerial.on('data', function(data) {
            console.log('data received: ' + data);
        });
    });

    setupCaptureDir();

    app.use(express.static(path.join(__dirname, 'static')));

    var html_dir = './static/';

    // routes to serve the static HTML files
    app.get('/', function(req, res) {
        res.sendfile(html_dir + 'index.html');
    });

    var handleSerialResponse = function(err, results) {
        console.log('err ' + err);
        console.log('results ' + results);

    };

    // listen for new socket.io connections:
    io.sockets.on('connection', function (socket) {
        console.log('Connected');
        clientSocket = socket;
        delivery = Delivery.listen(clientSocket);

        socket.on('lengine', function (data) {
            var command = "leng"+ getArduinoSpeed(data.val) + "\n";
            console.log('LeftEngine ' + command);

            arduinoSerial.write(command, handleSerialResponse);
        });

        socket.on('rengine', function (data) {
            var command = "reng" + getArduinoSpeed(data.val) + "\n";
            console.log('RightEngine: ' + command);

            arduinoSerial.write(command, handleSerialResponse);
        });

        socket.on('all_engine', function (data) {
            var command = "all_eng" + getArduinoSpeed(data.val) + "\n";
            console.log('AllEngine: ' + command);

            arduinoSerial.write(command, handleSerialResponse);
        });

        socket.on('rev_all_engine', function (data) {
            var command = "rev_all_eng" + getArduinoSpeed(data.val) + "\n";
            console.log('ReverseEngine: ' + command);

            arduinoSerial.write(command, handleSerialResponse);
        });

        socket.on('watch', function (data) {
            console.log('*** WATCHING ***');
            isWatching = true;
            startCapture();
        });
        socket.on('unwatch', function (data) {
            console.log('*** UNWATCHING ***');
            stopCapture();
        });

        delivery.on('send.success', function(file) {
            console.log('Delivered ' + file);
            delivering = false;
        });
    });

    io.sockets.on('disconnect', function() {
        console.log('DISConnected');
        stopCapture();
    });

    function getCaptureFileName(itemId) {
        return '/tmp/rvid/cam' + itemId + '.jpg';
    }

    function deliverCapture(filename) {
        if(isWatching) {
            console.log('Delivering ' + filename);
            if(! delivering) {
                console.log('Sending ' + filename);
                delivering = true;
                delivery.send({
                    name: lastCaptureId + '.jpg',
                    path : filename
                });
            }
        }
    }

    function startCapture() {
//        var cmd = 'streamer -t 100 -r 1 -q -C /dev/video0 -o';
//        console.log('Capturing: ' + cmd);

        var spawn = ChildProcess.spawn;
//        var cameraExec = spawn('raspistill', ['-b 2', '-t 100 -r 1 -q -C', '/dev/video0', '-o /tmp/rvid/cam00.jpeg'],
        cameraExec = spawn('raspistill', ['-w','640','-h','480','-q','85','-tl','1000','-t','10000','-th','0:0:0',
            '-o','/tmp/rvid/cam%d.jpg'], { stdio: 'inherit'});

        cameraExec.on('close', function(code) {
            cleanupAfterCapture();

            if(isWatching) {
                startCapture(); //restarts
            }
        });

        startFileWatch();
        deleteIntervalId = setInterval(deleteOldCapture, 5 * 1000);
    }

    function stopCapture() {
        isWatching = false;
        if(cameraExec) {
            cameraExec.kill();
        }
    }

    function cleanupAfterCapture() {
        lastCaptureId = 1;
        lastToDelete = 1;

        stopFileWatch();
        clearInterval(deleteIntervalId);
    }

    function startFileWatch() {
        watcher.watch('/tmp/rvid', {ignored: /^\./}).on('add', function(f) {
                var itemId = f.substr('/tmp/rvid/cam'.length);
//                console.log('Substring ' + itemId);
                if(f.indexOf('~') === -1) {
                    itemId = itemId.replace('.jpg', '');

                    var recentCaptureId = parseInt(itemId);
                    console.log('Captured ' + recentCaptureId);
                    if(recentCaptureId >= lastCaptureId) {
                        lastCaptureId = recentCaptureId;
                        deliverCapture(getCaptureFileName(lastCaptureId));
                    }
                }
        });
    }

    function stopFileWatch() {
        watcher.close();
    }


    function deleteCaptureFile(fileName) {
        console.log('Deleting ' + fileName);
        fs.unlink(fileName, function (err) {
            if (err) {
                console.error('Could not delete ' + fileName + ' ' + err);
            } else {
                console.log('successfully deleted ' + fileName);
            }
        });
    }

    function setupCaptureDir() {
        var dir = '/tmp/rvid';
        if(!fs.existsSync(dir)) {
            fs.mkdir(dir, function(err) {
                if(err) {
                    throw err;
                }
            });
        }
    }

    function deleteOldCapture() {
        for(var i=lastToDelete; i < lastCaptureId; i ++) {
            deleteCaptureFile(getCaptureFileName(i));
        }
        lastToDelete = lastCaptureId;
    }


    function getArduinoSpeed(speedGear) {
        return baseSpeed + speedGear * 10;
    }

    http.listen(8000);
})();