var lobbyhandler = require('lobbyhandler'),
c = require('commons'),
io = require('../lib/socket.io/lib/socket.io'),
_ = require('../shared/underscore-min');

var playerGames = {};
var games = {};
var sessionPlayers = {};
var playerClients = {};

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

exports.createGame = function(player, name) {
	var cmd = 'createGame';
	if (!c.isSet(games[name])) {
		var game = new Game(640, 480).createBlocks(16).createBricks(16);
		game.name = name;
		games[name] = game;
		playerGames[player] = game;
		game.addBody(player);
		c.log('Player ' + player.nick + ' created game ' + name);
		return c.success(cmd, game.serialize());
	} else {
		return c.error(cmd, 1, 'NAME TAKEN');
	}
};

exports.joinGame = function(player, name) {
	var cmd = 'joinGame';
	var g = games[name];
	if (c.isSet(g)) {
		if (g.addBody(player)) {
			c.log('Player ' + player.nick + ' join game ' + name);
			return c.success(cmd, g);
		} else {
			c.log('Player ' + player.nick + ' unable to join game ' + name);
			return c.error(cmd, 2, 'GAME CLOSED');
		}
	} else {
		return c.error(cmd, 1, 'UNKOWN GAME');
	}
};

exports.getGames = function() {
	var cmd = 'getGame';
	var ret = [];
	_.each(games, function(g) {
		ret.push(g.name);
	});
	return c.success(cmd, ret);
};

var sendAll = function(game, msg) {
	_.each(game.players, function(player) {
		playerClients[player.nick].send(msg);
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
		c.log('IO: ' + player.nick + ' STARTED GAME');
		sendAll(game, c.success(cmd));
	} else {
		c.log('IO: ' + player.nick + ' TRIED TO START GAME');
		client.send(c.error(cmd, 0, 'NOT OWNER'));
	};
};

var bounce = function(player, game, msg) {
	if (c.isSet(player) && c.isSet(game)) {
		sendAll(game, _.extend({
			player: player.nick
		},
		msg));
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
			case 'startMove':
				bounce(p, g, msg);
				break;
			default:
				c.log('IO: Unkown command ' + msg.cmd);
				break;
			}
		});
		client.on('disconnect', function() {
			console.log('disc');
		});
	});
};

