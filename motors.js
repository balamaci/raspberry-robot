if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([ 'serialport'], function(SerialPort) {

    var Motors = function(app) {
        this.app = app;
        this.baseSpeed = 180;
        this.arduinoSerialPort = "/dev/ttyACM0";
    };

    Motors.prototype.init = function() {
        var that = this;

        var arduinoSerial = new SerialPort.SerialPort(this.arduinoSerialPort, {
            baudrate: 19200,
            parser: SerialPort.parsers.readline("\n")
        });

        arduinoSerial.open(function () {

            var pathActions = that.app.get('pathActions');

            arduinoSerial.on('data', function(data) {
                serialFeedback = data.trim();
                if(serialFeedback === 'Stopped engines') {
                    if(pathActions.actions) {
                        pathActions.executeNextPathAction();

                        var clientSocket = that.app.get('clientSocket');
                        clientSocket.emit('executing', { action : pathActions.lastExecutedPathAction });
                    }
                }
                console.log('data received: "' + serialFeedback + '"');
            });
        });
        this.arduinoSerial = arduinoSerial;
    };

    Motors.prototype.left = function(data) {
        this.motorCommand("leng", data);
    };

    Motors.prototype.right = function(data) {
        this.motorCommand("reng", data);
    };

    Motors.prototype.forward = function(data) {
        this.motorCommand("all_eng", data);
    };

    Motors.prototype.reverse = function(data) {
        this.motorCommand("rev_all_eng", data);
    };

    Motors.prototype.motorCommand = function(command, data) {
        console.log('Data ' + JSON.stringify(data));
        command += this.getArduinoSpeed(data.val);
        if(data.timeMs) {
            command += '_' + data.timeMs;
        }
        command += "\n";

        console.log('Command ' + command);
        var that = this;
        this.arduinoSerial.write(command, function(err, results) {
            var clientSocket = that.app.get('clientSocket');
            that.handleSerialResponse(err, results, clientSocket);
        });
    };

    Motors.prototype.stop = function() {
        var that = this;
        this.arduinoSerial.write('stop\n', function(err, results) {
            var clientSocket = that.app.get('clientSocket');
            that.handleSerialResponse(err, results, clientSocket);
        });
    };

    Motors.prototype.handleSerialResponse = function(err, results, clientSocket) {
        if(err) {
            console.log('err ' + err);
            clientSocket.emit('motor_error', { error : err.message });
        }

//        console.log('serial response ' + results);
    };

    Motors.prototype.getArduinoSpeed = function(speedGear) {
        var speed = this.baseSpeed;

        if(speedGear) {
            speed += speedGear * 10;
        }
        return speed;
    };

    var exports = Motors;
    return exports;

});