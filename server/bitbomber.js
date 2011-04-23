require.paths.unshift(__dirname);

var http = require('http'),
nodeStatic = require('node-static'),
url = require('url'),
players = require('players.js'),
socketio = require('socket.io'),
port = 8000;

global.OGE = require('../shared/js/oge.min.js');
require('../shared/js/player.js');

var server = http.createServer(function(req, res) {
    var publicFiles = new nodeStatic.Server('../public', {
        cache: false
    }), sharedFiles = new nodeStatic.Server('../shared', {
        cache: false
    });

    publicFiles.serve(req, res, function (e) {
        if (e) {
            sharedFiles.serve(req, res);
        }
    });
});

var socket = socketio.listen(server);

players.init(socket);

server.listen(port);
console.log('Server running at ' + port);
