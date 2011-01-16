var gamehandler = require('gamehandler'),
c = require('commons');

var playerNicks = {};
var playerGuids = {};

var logPlayer = function(guid, action) {
	c.log('Player ' + action + ': ' + playerGuids[guid].nick + ' - ' + guid);
};

var loginPlayer = function(guid, nick, player) {
	var cmd = 'loginPlayer';
	if (!c.isSet(guid)) {
		if (c.isSet(nick) && ! c.isSet(playerNicks[nick])) {
			var player = new Player(nick);
			playerNicks[player.nick] = player;
			var guid = c.guid();
			playerGuids[guid] = player;
			logPlayer(guid, 'created');
			return c.success(cmd, {
				nick: player.nick,
				guid: guid
			});
		} else {
			return c.error(cmd, 2, 'NICK ALREADY IN USE');
		}
	} else {
		if (c.isSet(player)) {
			logPlayer(guid, 'reloaded');
			return c.success(cmd, player);
		} else {
			return c.error(cmd, 1, 'UNKOWN PLAYER');
		}
	}
};

var logoutPlayer = function(guid, player) {
	var cmd = 'logoutPlayer';
	if (c.isSet(player)) {
		logPlayer(guid, 'logged out');
		gamehandler.playerLogout(player);
		delete playerNicks[player.nick];
		delete playerGuids[guid];
		return c.success(cmd);
	} else {
		return c.error(cmd, 0, 'UNKOWN PLAYER');
	}
};

exports.getPlayerByGuid = function(guid) {
	return playerGuids[guid];
};

exports.incoming = function(response, params) {
	var res;
	var p = playerGuids[params.guid];
	switch (params.cmd) {
	case 'loginPlayer':
		res = loginPlayer(params.guid, params.nick, p);
		break;
	case 'logoutPlayer':
		res = logoutPlayer(params.guid, p);
		break;
	case 'createGame':
		if (c.isSet(p)) {
			res = gamehandler.createGame(p, params.name);
		} else {
			res = c.error(params.cmd, 0, 'UNKNOWN PLAYER');
		}
		break;
	case 'joinGame':
		if (c.isSet(p)) {
			res = gamehandler.joinGame(p, params.name);
		} else {
			res = c.error(params.cmd, 0, 'UNKNOWN PLAYER'); 
		}
		break;
	case 'getgames':
		if (c.isSet(p)) {
			res = gamehandler.getGames();
		} else {
			res = c.error(params.cmd, 0, 'UNKOWN PLAYER');
		}
		break;
	default:
		res = c.error(params.cmd, 0, 'UNKNOWN COMMAND');
	}
	c.jsonEnd(response, res);
};

