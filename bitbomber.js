var http = require('http'),
nodeStatic = require('node-static'),
url = require('url'),
players = require('players'),
games = require('games'),
ingame = require('ingame'),
nowjs = require('now');
port = 8000;

var server = http.createServer(function(req, res) {
	var publicFiles = new nodeStatic.Server('public', {
		cache: false
	}), sharedFiles = new nodeStatic.Server('shared', {
		cache: false
	});

	publicFiles.serve(req, res, function (e) {
		if (e) {
			sharedFiles.serve(req, res);
		}
	});
});

var everyone = nowjs.initialize(server);

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

everyone.now.register = players.register;
everyone.now.playNow = games.playNow;
everyone.now.startEndMove = ingame.startEndMove;

everyone.on('disconnect', function(clientId) {
	games.logout(clientId);
	players.logout(clientId);
});

server.listen(port);
console.log('Server running at ' + port);
