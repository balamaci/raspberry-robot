var requirejs = require('requirejs');
requirejs.config({
    nodeRequire: require
});

requirejs([ 'http', 'path', 'express', 'socket.io', './path_actions', './motors' ],
        function(Http, Path, Express, Socketio, PathActions, Motors) {

    var app = Express();
    var server = Http.createServer(app).listen(8000);
    var io = Socketio.listen(server),
        pathActions = new PathActions(app),
        motors = new Motors(app);


    var clientSocket;


    app.use(Express.static(Path.join(__dirname, 'static')));
    app.set('motors', motors);
    app.set('pathActions', pathActions);

    var html_dir = './static/';

    // routes to serve the static HTML files
    app.get('/', function(req, res) {
        res.sendfile(html_dir + 'index.html');
    });


    // listen for new socket.io connections:
    io.sockets.on('connection', function (socket) {
        console.log('Connected');
        clientSocket = socket;
        app.set('clientSocket', clientSocket);

        socket.on('lengine', function (data) {
            motors.left(data);
        });

        socket.on('rengine', function (data) {
            motors.right(data);
        });

        socket.on('all_engine', function (data) {
            motors.forward(data);
        });

        socket.on('rev_all_engine', function (data) {
            motors.reverse(data);
        });

        socket.on('exec_actions', function (data) {
            pathActions.actions = JSON.parse(data.actions);
            console.log('Received Path actions: ' + JSON.stringify(pathActions.actions));
            pathActions.poz = 0;

            motors.stop();
        });

        socket.on('stop_engines', function () {
            pathActions.actions = null;
            motors.stop();
        });

        socket.on('watch', function (data) {
            console.log('*** WATCHING ***');
//            camera.startCapture();
        });
        socket.on('unwatch', function (data) {
            console.log('*** UNWATCHING ***');
//            camera.stopCapture();
        });

    });

    io.sockets.on('disconnect', function() {
        console.log('DISConnected');
//        camera.stopCapture();
    });

});