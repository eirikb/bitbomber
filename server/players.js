var bitbomber = require('bitbomber'),
players = {};

require('bitbomber')

var register = function(client, privateGuid) {
	var player = players[privateGuid];
	if (!player) {
		player = new Player(0, 0, 16, 16);
		privateGuid = guid();
		player.privateGuid = privateGuid;
		players[privateGuid] = player;
	}
	player.publicGuid = guid();
	client.send({
		cmd: 'register', 
		player: player
	});
};

exports.logoutPlayer = function(player) {
	/*
	if (c.isSet(b.playerNicks[player.nick])) {
		logoutPlayer(player);
	}
	*/
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

var s4 = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

var guid = function() {
	return s4() + s4();
};

exports.init = function(socket) {
	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			switch (msg.cmd) {
				case 'register':
					if (!client.player) {
						register(client, msg.privateGuid);
					} else {
						console.log('already registered');
					}
					break;
				case 'setNick':
					players.authPlayer(cmd, client, msg.data.guid);
					break;
			}
		});
	});
	socket.on('disconnect', function(client) {
		console.log(client);
	});
};

