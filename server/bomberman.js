var http = require('http'),
nodeStatic = require('../lib/node-static/lib/node-static'),
c = require('commons'),
url = require('url'),
lobbyhandler = require('lobbyhandler'),
gamehandler = require('gamehandler'),
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
    gamehandler.startBombTimer();
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
				var cmd = params.cmd;
				switch (params.cmd) {
				case 'loginPlayer':
					res = lobbyhandler.loginPlayer(cmd, params.guid, params.nick, p);
					break;
				case 'logoutPlayer':
					res = lobbyhandler.logoutPlayer(cmd, p);
					break;
				case 'createGame':
					if (c.isSet(p)) {
						res = gamehandler.createGame(cmd, p, params.name);
					} else {
						res = c.error(params.cmd, 0, 'UNKNOWN PLAYER');
					}
					break;
				case 'joinGame':
					if (c.isSet(p)) {
						res = gamehandler.joinGame(cmd, p, params.name);
					} else {
						res = c.error(params.cmd, 0, 'UNKNOWN PLAYER'); 
					}
					break;
				default:
					res = c.error(params.cmd, 0, 'UNKNOWN COMMAND');
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
				gamehandler.authPlayer(cmd, client, msg.data.guid);
				break;
			case 'startGame':
				gamehandler.startGame(cmd, client, p, g);
				break;
			case 'endMove':
				gamehandler.endMove(cmd, p, g, msg.data);
				break;
			case 'startMove':
				gamehandler.startMove(cmd, p, g, msg.data);
				break;
			case 'placeBomb':
				gamehandler.placeBomb(cmd, p, g, msg.data);
				break;
			default:
				c.log('IO: Unkown command ' + msg.cmd);
				break;
			}
		});
		client.on('disconnect', function() {
			var player = b.sessionPlayers[client.sessionId];
			lobbyhandler.logoutPlayer('logoutPlayer', player);
		});
	});

	c.log('Server running on port ' + port);
};

module.exports = Bomberman;

