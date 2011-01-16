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
			console.log("lol")
			c.log('Player ' + player.nick + ' unable to join game ' + params.name);
			return c.error(2, 'GAME CLOSED');
		}
	} else {
		return c.error(1, 'UNKOWN GAME');
	}
};

var sendAll = function(game, msg) {
	_.each(game.players, function(player) {
		playerClients[player.nick].send(msg);
	});
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
			case 'auth':
				p = lobbyhandler.getPlayerByGuid(msg.guid);
				if (c.isSet(p)) {
					playerClients[p.nick] = client;
					sessionPlayers[client.sessionId] = p;
					client.send('OK');
				} else {
					client.send(c.error(0, 'UNKOWN GUID'));
				}
				break;
			case 'start':
				if (c.isSet(g) && g.owner === p) {
					c.log('IO: ' + p.nick + ' STARTED GAME');
					sendAll(g, {
						cmd: 'start'
					});
				} else {
					c.log('IO: ' + p.nick + ' TRIED TO START GAME');
					client.send(c.error(0, 'NOT OWNER'));
				};
				break;
            case 'endmove':
			case 'startmove':
				if (c.isSet(p) && c.isSet(g)) {
					sendAll(g, _.extend({
						player: p.nick
					},
					msg));
				};
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

