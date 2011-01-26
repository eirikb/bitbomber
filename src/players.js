var games = require('games'),
c = require('commons'),
b = require('bomberman');

var logPlayer = function(guid, action) {
	c.log('Player ' + action + ': ' + b.playerGuids[guid].nick + ' - ' + guid);
};

exports.loginPlayer = function(guid, nick, player) {
	if (!c.isSet(guid)) {
		if (c.isSet(nick) && ! c.isSet(b.playerNicks[nick])) {
			var player = new Player(0, 0, 16, 16, nick);
			b.playerNicks[player.nick] = player;
			var guid = c.guid();
			player.guid = guid;
			b.playerGuids[guid] = player;
			logPlayer(guid, 'created');
			return c.success({
				nick: player.nick,
				guid: guid
			});
		} else {
			return c.error(2, 'NICK ALREADY IN USE');
		}
	} else {
		if (c.isSet(player)) {
			logPlayer(guid, 'reloaded');
			return c.success(player);
		} else {
			return c.error(1, 'UNKOWN PLAYER');
		}
	}
};

exports.logoutPlayer = function(player) {
	if (c.isSet(b.playerNicks[player.nick])) {
		logoutPlayer(player);
	}
};

exports.authPlayer = function(cmd, client, guid) {
	var player = b.playerGuids[guid];
	if (c.isSet(player)) {
		b.playerClients[player.nick] = client;
		b.sessionPlayers[client.sessionId] = player;
		client.send(c.success(cmd, {
			nick: player.nick,
			guid: guid
		}));
	} else {
		client.send(c.error(cmd, 0, 'UNKOWN GUID'));
	}

};

var logoutPlayer = function(player) {
	if (c.isSet(player)) {
		logPlayer(player.guid, 'logged out');
		gamehandler.playerLogout(player);
		delete b.playerNicks[player.nick];
		delete b.playerGuids[player.guid];
		return c.success();
	} else {
		return c.error(0, 'UNKOWN PLAYER');
	}
};

