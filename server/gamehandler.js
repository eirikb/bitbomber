var lobbyhandler = require('lobbyhandler'),
c = require('commons'),
io = require('../lib/socket.io/lib/socket.io'),
_ = require('../lib/underscore/underscore');

var playerGames = {};
var games = {};
var sessionPlayers = {};
var playerClients = {};
var openGames = {};

exports.playerLogout = function(player) {
	var g = playerGames[player];
	if (c.isSet(g)) {
		g.removeBody(player);
		sendAll(g, c.success('playerLogout', {
			player: player.nick
		}));
		if (g.players.length == 0) {
			delete games[g.guid];
			delete openGames[g.guid];
			c.log('Game deleted ' + g.guid);
		}
	}
};

exports.createGame = function(player) {
	var cmd = 'createGame';
	var guid = c.guid;
	if (!c.isSet(games[guid])) {
		var game = new Game(640, 480).createBlocks(16).createBricks(16, 20);
		var guid = c.guid();
		game.guid = guid;
		games[guid] = game;
		openGames[guid] = game;
		playerGames[player] = game;
		game.addBody(player, true);
		c.log('Player ' + player.nick + ' created game ' + guid);
		var data = game.serialize();
		return c.success(cmd, game.serialize());
	} else {
		return c.error(cmd, 1, 'GUID TAKEN');
	}
};

exports.joinGame = function(player) {
	var cmd = 'joinGame';
	var games = _.keys(openGames);
	if (games.length > 0) {
		var i = Math.floor(Math.random() * games.length);
		var g = openGames[games[Math.floor(Math.random() * games.length)]];
		var x = 0,
		y = 0;
		switch (g.players.length) {
		case 1:
		case 3:
			x = g.world.width - player.width;
			break;
		case 2:
		case 3:
			y = g.world.height - player.height;
			break;
		}
		player.x = x;
		player.y = y;
		if (g.addBody(player, true)) {
			c.log('Player ' + player.nick + ' join game ' + g.guid);
			sendAll(g, c.success('joinGame', {
				player: player.serialize()
			}), player);
			return c.success(cmd, g.serialize());
		} else {
			c.log('Player ' + player.nick + ' unable to join game ' + g.guid);
			return c.error(cmd, 2, 'GAME CLOSED');
		}

	} else {
		return c.error(cmd, 1, 'NO OPEN GAMES');
	}
};

var sendAll = function(game, msg, excludePlayer) {
	_.each(game.players, function(player) {
		if (!excludePlayer || player.nick !== excludePlayer.nick) {
			playerClients[player.nick].send(msg);
		}
	});
};

var authPlayer = function(client, guid) {
	var cmd = 'authPlayer';
	var player = lobbyhandler.getPlayerByGuid(guid);
	if (c.isSet(player)) {
		playerClients[player.nick] = client;
		sessionPlayers[client.sessionId] = player;
		client.send(c.success(cmd, player));
	} else {
		client.send(c.error(cmd, 0, 'UNKOWN GUID'));
	}

};

var startGame = function(client, player, game) {
	var cmd = 'startGame';
	if (c.isSet(game) && game.owner === player) {
		delete openGames[game.guid];
		c.log('IO: ' + player.nick + ' STARTED GAME');
		sendAll(game, c.success(cmd));
	} else {
		c.log('IO: ' + player.nick + ' TRIED TO START GAME');
		client.send(c.error(cmd, 0, 'NOT OWNER'));
	};
};

exports.setServer = function(server) {
	var socket = io.listen(server, {
		flashPolicyServer: false
	});

	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			var p = sessionPlayers[client.sessionId];
			var g = playerGames[p];
			switch (msg.cmd) {
			case 'authPlayer':
				authPlayer(client, msg.data.guid);
				break;
			case 'startGame':
				startGame(client, p, g);
				break;
			case 'endMove':
				var x = parseInt(msg.data.x, 10);
				var y = parseInt(msg.data.y, 10);
				sendAll(g, c.success(msg.cmd, {
					x: x,
					y: y,
					player: p.nick
				}), p);
				break;
			case 'startMove':
				var cos = parseInt(msg.data.cos, 10);
				var sin = parseInt(msg.data.sin, 10);
				sendAll(g, c.success(msg.cmd, {
					cos: cos,
					sin: sin,
					player: p.nick
				}), p);
				break;
			default:
				c.log('IO: Unkown command ' + msg.cmd);
				break;
			}
		});
		client.on('disconnect', function() {
			var player = sessionPlayers[client.sessionId];
			lobbyhandler.logoutPlayer(player);
		});
	});
};

