(function () {
    "use strict";
    var path = require('path'),
        async = require('async'),
        serialport = require("serialport"),
        SerialPort  = serialport.SerialPort;

    var tests = [
            [leftEngineOn, 10],
            [rightEngineOn, 1700],
            [leftEngineOn, 1800],
            [allEnginesRev, 600],
            [allEnginesOn, 900],
            [leftEngineOn, 700],
            [allEnginesOn, 600],
            [rightEngineOn, 800],
            [allEnginesRev, 700]
        ],
        testCount = 0;

    var baseSpeed = 180; //the base speed from which the motors start up

    var arduinoSerial = new SerialPort("/dev/ttyACM0", {
        baudrate: 4800
    });

    arduinoSerial.open(function () {
        console.log('open');
        arduinoSerial.on('data', function(data) {
            console.log('data received: ' + data);
        });

        doNextTest();
    });

    function doNextTest() {
        var testFunction = tests[testCount][0];
        var timeout = tests[testCount][1];

        setTimeout(function() {
            testFunction.call();
        }, timeout);

        testCount++;

        if(testCount >= tests.length) {
            testCount = 0;
        }
    }

    function leftEngineOn() {
        var command = "leng"+ getArduinoSpeed(baseSpeed) + "*";
        console.log('LeftEngine ' + command);

        arduinoSerial.write(command, function(err, results) {
            console.log('err ' + err);
            doNextTest();
        });
    }

    function rightEngineOn() {
        var command = "reng" + getArduinoSpeed(baseSpeed) + "*";
        console.log('RightEngine: ' + command);

        arduinoSerial.write(command, function(err, results) {
//            console.log('err ' + err);
            doNextTest();
        });
    }

    function allEnginesOn() {
            var command = "all_eng" + getArduinoSpeed(baseSpeed) + "*";
            console.log('AllEngine: ' + command);

            arduinoSerial.write(command, function(err, results) {
//                console.log('err ' + err);
                doNextTest();
            });
    }

    function allEnginesRev() {
        var command = "rev_all_eng" + getArduinoSpeed(baseSpeed) + "*";
        console.log('ReverseEngine: ' + command);

        arduinoSerial.write(command, function(err, results) {
//            console.log('err ' + err);
            doNextTest();
        });
    }


    function getArduinoSpeed(speed) {
        return speed;
    }

})();