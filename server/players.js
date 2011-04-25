var players = {},
Player = require('player');

var register = function(client, privateGuid) {
	var player = players[privateGuid];
	if (!player) {
		player = new Player(0, 0, 16, 16);
		privateGuid = guid(4);
		player.privateGuid = privateGuid;
		players[privateGuid] = player;
	}
	player.publicGuid = guid(4);
	client.player = player;
	player.client = client;
	var playerData = player.serialize();
	playerData.privateGuid = player.privateGuid;
	client.send({
		cmd: 'register', 
		player: playerData
	});
};

var logout = function() {
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
				case 'login':
					if (client.player) {
						client.player.nick = msg.nick;
					}
					break;
			}
		});
	});
	socket.on('disconnect', function(client) {
		logout(client);
	});
};

