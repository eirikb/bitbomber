var lobbyhandler = require('lobbyhandler'),
c = require('commons'),
io = require('../lib/socket.io/lib/socket.io');

var playerGames = {};
var games = {};

exports.playerLogout = function(player) {
	var g = playerGames[player];
	if (c.isSet(g)) {
		g.removeBody(player);
		if (g.players.length == 0) {
			c.log('Game deleted ' + g.name);
			delete games[g.name];
		}
	}
};

exports.createGame = function(player, params) {
	if (!c.isSet(games[params.name])) {
		var game = new Game(640, 480);
		game.name = params.name;
		games[params.name] = game;
		playerGames[player] = game;
		game.addBody(player);
		c.log('Player ' + player.nick + ' created game ' + params.name);
		return game;
	} else {
		return c.error(1, 'NAME TAKEN');
	}
};

exports.joinGame = function(player, params) {
	var g = games[params.name];
	if (c.isSet(g)) {
		if (g.addBody(player)) {
			c.log('Player ' + player.nick + ' join game ' + params.name);
			return g;
		} else {
			c.log('Player ' + player.nick + ' unable to join game ' + params.name);
			return c.error(2, 'GAME CLOSED');
		}
	} else {
		return c.error(1, 'UNKOWN GAME');
	}
};

exports.setServer = function(server) {
	var socket = io.listen(server, {
		flashPolicyServer: false
	});

	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			var p = lobbyhandler.getPlayerByGuid(msg.guid);
			var g = playerGames[p];
			switch (msg.cmd) {
			case 'start':
				if (c.isSet(g) && g.owner === p) {
					c.log('IO: ' + p.nick + ' STARTED GAME');
					client.send('OK');
				} else {
					c.log('IO: ' + p.nick + ' TRIED TO START GAME');
					client.send(c.error(0, 'NOT OWNER'));
				};
				break;
			default:
				c.log('IO: Unkown command ' + message.data.cmd);
				break;
			}
		});
		client.on('disconnect', function() {
			console.log('disc');
		});
	});
};

