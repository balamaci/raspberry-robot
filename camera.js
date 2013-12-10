var lastCaptureId = 1,
    lastToDelete = 1,
    delivering,
    deleteIntervalId,
    isWatching,
    cameraExec;

var watcher = require('chokidar'),
    fs  = require('fs');

var setupCaptureDir = function() {
    var dir = '/tmp/rvid';
    if(!fs.existsSync(dir)) {
        fs.mkdir(dir, function(err) {
            if(err) {
                throw err;
            }
        });
    }
};

var deleteOldCapture = function() {
    for(var i=lastToDelete; i < lastCaptureId; i ++) {
        deleteCaptureFile(getCaptureFileName(i));
    }
    lastToDelete = lastCaptureId;
};

var deleteCaptureFile = function(fileName) {
    console.log('Deleting ' + fileName);
    fs.unlink(fileName, function (err) {
        if (err) {
            console.error('Could not delete ' + fileName + ' ' + err);
        } else {
            console.log('successfully deleted ' + fileName);
        }
    });
};

var startFileWatch = function() {
    watcher.watch('/tmp/rvid', {ignored: /^\./}).on('add', function(f) {
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

var startCapture = function() {
    isWatching = true;
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
};

function getCaptureFileName(itemId) {
    return '/tmp/rvid/cam' + itemId + '.jpg';
}

var cleanupAfterCapture = function() {
    lastCaptureId = 1;
    lastToDelete = 1;

    stopFileWatch();
    clearInterval(deleteIntervalId);
};

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

function stopCapture() {
    isWatching = false;
    if(cameraExec) {
        cameraExec.kill();
    }
}

function stopFileWatch() {
    watcher.close();
}

module.exports.delivering = delivering;
module.exports.setupCaptureDir = setupCaptureDir;
module.exports.deleteCaptureFile = deleteCaptureFile;
module.exports.deleteOldCapture = deleteOldCapture;
module.exports.stopCapture = stopCapture;

