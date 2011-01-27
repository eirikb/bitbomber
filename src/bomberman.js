var http = require('http'),
nodeStatic = require('../lib/node-static/lib/node-static'),
c = require('commons'),
url = require('url'),
players = require('players'),
games = require('games'),
ingame = require('ingame'),
OGE = require('../lib/bomberman-game/dist/bomberman'),
io = require('../lib/socket.io/lib/socket.io'),
b = require('bomberman');

global._ = require('../lib/underscore/underscore');

exports.playerGames = {};
exports.games = {};
exports.sessionPlayers = {};
exports.playerClients = {};
exports.openGames = {};

exports.playerNicks = {};
exports.playerGuids = {};

function Bomberman(port) {
	global._ = _;
	ingame.startBombTimer();
	var server = http.createServer(function(request, response) {
		var publicFiles = new nodeStatic.Server('public', {
			cache: false
		});

		request.addListener('end', function() {
			var location = url.parse(request.url, true),
			params = (location.query || request.headers);
			if (location.pathname === '/lobby') {

				var res;
				var p = b.playerGuids[params.guid];
				switch (params.cmd) {
				case 'loginPlayer':
					res = players.loginPlayer(params.guid, params.nick, p);
					break;
				case 'logoutPlayer':
					res = players.logoutPlayer(p);
					break;
				case 'createGame':
					if (c.isSet(p)) {
						res = games.createGame(p, params.name);
					} else {
						res = c.error(0, 'UNKNOWN PLAYER');
					}
					break;
				case 'joinGame':
					if (c.isSet(p)) {
						res = games.joinGame(params.cmd, p, params.name);
					} else {
						res = c.error(0, 'UNKNOWN PLAYER'); 
					}
					break;
				default:
					res = c.error(0, 'UNKNOWN COMMAND');
				}
				c.jsonEnd(response, res);
			} else {
				publicFiles.serve(request, response);
			}
		});
	});

	server.listen(port);

	var socket = io.listen(server, {
		flashPolicyServer: false
	});

	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			var p = b.sessionPlayers[client.sessionId],
			g;
			if (typeof p !== 'undefined') {
				g = b.playerGames[p.nick];
			}
			var cmd = msg.cmd;
			switch (cmd) {
			case 'authPlayer':
				players.authPlayer(cmd, client, msg.data.guid);
				break;
			case 'startGame':
				games.startGame(cmd, client, p, g);
				break;
			case 'endMove':
				ingame.endMove(cmd, p, g, msg.data);
				break;
			case 'startMove':
				ingame.startMove(cmd, p, g, msg.data);
				break;
			case 'placeBomb':
				ingame.placeBomb(cmd, p, g, msg.data);
				break;
			case 'playerDead':
				ingame.playerDead(cmd, p, g, msg.data);
				break;
			case 'resurectPlayer':
				ingame.resurectPlayer(cmd, p, g, msg.data);
				break;
			default:
				c.log('IO: Unkown command ' + msg.cmd);
				break;
			}
		});
		client.on('disconnect', function() {
			var player = b.sessionPlayers[client.sessionId];
			players.logoutPlayer('logoutPlayer', player);
		});
	});

	c.log('Server running on port ' + port);
};

module.exports = Bomberman;

