var gamehandler = require('gamehandler'),
c = require('commons');

var playerNicks = {};
var playerGuids = {};

var logPlayer = function(guid, action) {
	c.log('Player ' + action + ': ' + playerGuids[guid].nick + ' - ' + guid);
};

exports.getPlayerByGuid = function(guid) {
	return playerGuids[guid];
};

exports.incoming = function(response, params) {
	var res;
	var p = playerGuids[params.guid];
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
				res = c.error(2, 'NICK ALREADY IN USE');
			}
		} else {
			if (c.isSet(p)) {
				res = p;
				logPlayer(params.guid, 'reloaded');
			} else {
				res = c.error(1, 'UNKOWN PLAYER');
			}
		}
		break;
	case 'logout':
		if (c.isSet(p)) {
			logPlayer(params.guid, 'logged out');
			gamehandler.playerLogout(p);
			delete playerNicks[p.nick];
			delete playerGuids[params.guid];
			res = 'OK';
		} else {
			res = c.error(0, 'UNKOWN PLAYER');
		}
		break;
	case 'create':
		if (c.isSet(p)) {
			res = gamehandler.createGame(p, params);
		} else {
			res = c.error(0, 'UNKNOWN PLAYER');
		}
		break;
	case 'join':
		if (c.isSet(p)) {
			res = gamehandler.joinGame(p, params);
		} else {
			res = c.error(0, 'UNKNOWN PLAYER'); 
		}
		break;
	default:
		res = c.error(0, 'UNKNOWN COMMAND');
	}
	c.jsonEnd(response, res);
};

