var sys = require('sys'),
c = require('commons');

var playerNicks = {};
var playerGuids = {};

exports.lobby = function(response, params) {
	var res;
	switch (params.cmd) {
	case 'login':
		if (!c.isSet(params.guid)) {
			if (c.isSet(params.nick) && ! c.isSet(playerNicks[params.nick])) {
				var player = new Player(params.nick);
				player.guid = c.guid();
				playerNicks[player.nick] = player;
				playerGuids[player.guid] = player;
				c.log('Player created: ' + player.nick + ' - ' + player.guid);
				res = {
					nick: player.nick,
					guid: player.guid
				};
			} else {
				res = {
					error: 'NICK ALREADY IN USE',
					code: 2
				};
			}
		} else {
            var p = playerGuids[params.guid];
			if (c.isSet(p)) {
                c.log('Player reloaded: ' + p.nick + ' - ' + p.guid);
				res = p;
			} else {
				res = {
					error: 'UNKOWN GUID',
					code: 1
				};
			}
		}
		break;
	case 'logout':
        var p = playerGuids[params.guid];
		if (c.isSet(p)) {
            c.log('Player logged out: ' + p.nick + ' - ' + p.guid);
			delete playerNicks[p.nick];
			delete playerGuids[p.guid];
			res = 'OK';
		} else {
			res = {
				error: 'UNKOWN PLAYER',
				code: 0
			};
		}
		break;
	default:
		res = {
			error: 'UNKNOWN COMMAND',
			code: 0
		};
	}
	c.jsonEnd(response, res);
};

