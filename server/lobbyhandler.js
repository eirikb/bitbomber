var gamehandler = require('gamehandler'),
c = require('commons'),
b = require('bomberman');

var logPlayer = function(guid, action) {
	c.log('Player ' + action + ': ' + b.playerGuids[guid].nick + ' - ' + guid);
};

exports.loginPlayer = function(cmd, guid, nick, player) {
	if (!c.isSet(guid)) {
		if (c.isSet(nick) && ! c.isSet(b.playerNicks[nick])) {
			var player = new Player(0, 0, 16, 16, nick);
			b.playerNicks[player.nick] = player;
			var guid = c.guid();
			player.guid = guid;
			b.playerGuids[guid] = player;
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

exports.logoutPlayer = function(cmd, player) {
	if (c.isSet(b.playerNicks[player.nick])) {
		logoutPlayer(cmd, player);
	}
};

var logoutPlayer = function(cmd, player) {
	if (c.isSet(player)) {
		logPlayer(player.guid, 'logged out');
		gamehandler.playerLogout(cmd, player);
		delete b.playerNicks[player.nick];
		delete b.playerGuids[player.guid];
		return c.success(cmd);
	} else {
		return c.error(cmd, 0, 'UNKOWN PLAYER');
	}
};

