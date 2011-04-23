require.paths.unshift(__dirname);

var http = require('http'),
nodeStatic = require('node-static'),
url = require('url'),
players = require('players.js'),
games = require('games.js'),
socketio = require('socket.io'),
port = 8000;

global.OGE = require('../shared/js/oge.min.js');
require('../shared/js/player.js');
require('../shared/js/game.js');
require('../shared/js/box.js');
require('../shared/js/bomb.js');

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

var s4 = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

global.guid = function() {
	return s4() + s4() + s4() + s4();
};

players.init(socket);
games.init(socket);

server.listen(port);
console.log('Server running at ' + port);
