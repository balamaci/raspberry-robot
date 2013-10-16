(function () {
    "use strict";
    var path = require('path'),
        async = require('async'),
        serialport = require("serialport"),
        SerialPort  = serialport.SerialPort;

    var baseSpeed = 180; //the base speed from which the motors start up

    var arduinoSerial = new SerialPort("/dev/ttyACM0", {
        baudrate: 4800
    });

    arduinoSerial.open(function () {
        console.log('open');
        arduinoSerial.on('data', function(data) {
            console.log('data received: ' + data);
        });

        doTest();
    });

    function doTest() {
        async.series([leftEngineOn,
            function (callback) {
                setTimeout(function() {
                    rightEngineOn(callback);
                }, 700);
            },
            function (callback) {
                setTimeout(function() {
                    leftEngineOn(callback);
                }, 800);
            },
            function (callback) {
                setTimeout(function() {
                    allEnginesRev(callback);
                }, 600);
            },
            function (callback) {
                setTimeout(function() {
                    allEnginesRev(callback);
                }, 900);
            },
            function (callback) {
                setTimeout(function() {
                    leftEngineOn(callback);
                }, 700);
            },
            function (callback) {
                setTimeout(function() {
                    allEnginesOn(callback);
                }, 600);
            },
            function (callback) {
                setTimeout(function() {
                    rightEngineOn(callback);
                }, 600);
            },
            function (callback) {
                setTimeout(function() {
                    allEnginesRev(callback);
                }, 700);
            },
            function (callback) {
                setTimeout(function() {
                    leftEngineOn(callback);
                }, 800);
            },
            function() {
                setTimeout(function() {
                    doTest();
                }, 1000);
            }
        ]);
    }

    function leftEngineOn(callback) {
        var command = "leng"+ getArduinoSpeed(baseSpeed) + "*";
        console.log('LeftEngine ' + command);

        arduinoSerial.write(command, function(err, results) {
            console.log('err ' + err);
            callback(null);
        });
    }

    function rightEngineOn(callback) {
        var command = "reng" + getArduinoSpeed(baseSpeed) + "*";
        console.log('RightEngine: ' + command);

        arduinoSerial.write(command, function(err, results) {
//            console.log('err ' + err);
            callback(null);
        });
    }

    function allEnginesOn(callback) {
            var command = "all_eng" + getArduinoSpeed(baseSpeed) + "*";
            console.log('AllEngine: ' + command);

            arduinoSerial.write(command, function(err, results) {
//                console.log('err ' + err);
                callback(null);
            });
    }

    function allEnginesRev(callback) {
        var command = "rev_all_eng" + getArduinoSpeed(baseSpeed) + "*";
        console.log('ReverseEngine: ' + command);

        arduinoSerial.write(command, function(err, results) {
//            console.log('err ' + err);
            callback(null);
        });
    }


    function getArduinoSpeed(speed) {
        return speed;
    }

})();