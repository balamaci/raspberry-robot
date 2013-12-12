if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([ 'chokidar', 'delivery', 'fs' ], function( Watcher, Delivery, Fs) {

    var Camera = function(app) {
        this.lastCaptureId = 1;
        this.lastToDelete = 1;
        this.delivering = false;
        this.isWatching = false;

        this.deleteIntervalId = null;
        this.cameraExec = null;


    };

    function stopFileWatch() {
        Watcher.close();
    }

    function getCaptureFileName(itemId) {
        return '/tmp/rvid/cam' + itemId + '.jpg';
    }

    function deleteOldCapture() {
        for(var i=lastToDelete; i < lastCaptureId; i ++) {
            deleteCaptureFile(getCaptureFileName(i));
        }
        lastToDelete = lastCaptureId;
    }

    var deleteCaptureFile = function(fileName) {
        console.log('Deleting ' + fileName);
        Fs.unlink(fileName, function (err) {
            if (err) {
                console.error('Could not delete ' + fileName + ' ' + err);
            } else {
                console.log('successfully deleted ' + fileName);
            }
        });
    };

    function cleanupAfterCapture() {
        lastCaptureId = 1;
        lastToDelete = 1;

        stopFileWatch();
        clearInterval(this.deleteIntervalId);
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

    Camera.prototype.init = function() {
        var delivery = this.app.get("clientSocket");

        delivery.on('send.success', function(file) {
            console.log('Delivered ' + file);
        });
    };

    Camera.prototype.setupCaptureDir = function() {
        var dir = '/tmp/rvid';
        if(!Fs.existsSync(dir)) {
            Fs.mkdir(dir, function(err) {
                if(err) {
                    throw err;
                }
            });
        }
    };

    Camera.prototype.startFileWatch = function() {
        Watcher.watch('/tmp/rvid', {ignored: /^\./}).on('add', function(f) {
            var itemId = f.substr('/tmp/rvid/cam'.length);
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
    };

    Camera.prototype.startCapture = function() {
        this.isWatching = true;
        var that = this;

//        var cmd = 'streamer -t 100 -r 1 -q -C /dev/video0 -o';
//        console.log('Capturing: ' + cmd);

        var spawn = ChildProcess.spawn;
//        var cameraExec = spawn('raspistill', ['-b 2', '-t 100 -r 1 -q -C', '/dev/video0', '-o /tmp/rvid/cam00.jpeg'],
        cameraExec = spawn('raspistill', ['-w','640','-h','480','-q','85','-tl','1000','-t','10000','-th','0:0:0',
            '-o','/tmp/rvid/cam%d.jpg'], { stdio: 'inherit'});

        cameraExec.on('close', function(code) {
            cleanupAfterCapture();

            if(that.isWatching) {
                startCapture(); //restarts
            }
        });

        startFileWatch();
        deleteIntervalId = setInterval(deleteOldCapture, 5 * 1000);
    };

    Camera.prototype.stopCapture = function() {
        isWatching = false;
        if(cameraExec) {
            cameraExec.kill();
        }
    }


});


