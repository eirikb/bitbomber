var sys = require('sys'),
c = require('commons');

var playerNicks = {};
var playerGuids = {};
var games = {};

var logPlayer = function(guid, action) {
	c.log('Player ' + action + ': ' + playerGuids[guid].nick + ' - ' + guid);
};

var error = function(code, msg) {
	return {
		error: msg,
		code: code
	};
}

exports.lobby = function(response, params) {
	var res;
	switch (params.cmd) {
	case 'login':
		if (!c.isSet(params.guid)) {
			if (c.isSet(params.nick) && ! c.isSet(playerNicks[params.nick])) {
				var player = new Player(params.nick);
				playerNicks[player.nick] = player;
				var guid = c.guid();
				playerGuids[guid] = player;
				res = {
					nick: player.nick,
					guid: guid
				};
				logPlayer(guid, 'created');
			} else {
				res = error(2, 'NICK ALREADY IN USE');
			}
		} else {
			var p = playerGuids[params.guid];
			if (c.isSet(p)) {
				res = p;
				logPlayer(params.guid, 'reloaded');
			} else {
				res = error(1, 'UNKOWN PLAYER');
			}
		}
		break;
	case 'logout':
		var p = playerGuids[params.guid];
		if (c.isSet(p)) {
			delete playerNicks[p.nick];
			delete playerGuids[p.guid];
			res = 'OK';
			logPlayer(params.guid, 'logged out');
		} else {
			res = error(0, 'UNKOWN PLAYER');
		}
		break;
	case 'create':
		var p = playerGuids[params.guid];
		if (c.isSet(p)) {
			if (c.isSet(params.name) && ! c.isSet(games[params.name])) {
				var game = new Game(640, 480);
				games[params.name] = game;
				game.addBody(p);
				res = game;
				logPlayer(params.guid, 'created game ' + params.name);
			} else {
				res = error(1, 'NAME TAKEN');
			}
		} else {
			res = error(0, 'UNKNOWN PLAYER');
		}
		break;
	default:
		res = error(0, 'UNKNOWN COMMAND');
	}
	c.jsonEnd(response, res);
};

