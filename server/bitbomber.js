require.paths.unshift(__dirname);
require.paths.unshift(__dirname + '/../shared/js/');

var http = require('http'),
nodeStatic = require('node-static'),
url = require('url'),
players = require('players'),
games = require('games'),
ingame = require('ingame'),
socketio = require('socket.io'),
port = 8000;

global.OGE = require('oge.min');
require('player');
require('game');
require('box');
require('bomb');

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

global.guid = function(times) {
	if (!times) {
		times = 1;
	}
	var guid = '',
	i;
	for (i = 0; i < times; i++) {
		guid += s4();
	}
	return guid;
};

players.init(socket);
games.init(socket);
ingame.init(socket);

server.listen(port);
console.log('Server running at ' + port);
