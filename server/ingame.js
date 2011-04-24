var bombs = [];

var sendAll = function(game, msg, excludePlayer) {
	game.players.forEach(function(player) {
		if (!excludePlayer || player.publicGuid !== excludePlayer.publicGuid) {
			player.client.send(msg);
		}
	});
};

var startEndMove = function(player, data) {
	if (data.cos && data.sin) {
		player.direction = new OGE.Direction(parseInt(data.cos, 10), parseInt(data.sin, 10));
	} else {
		player.direction = null;
	}
	player.x = parseInt(data.x, 10);
	player.y = parseInt(data.y, 10);
	data.publicGuid = player.publicGuid;
	sendAll(player.game, data, player);
};

exports.joinGame = function(player) {
	sendAll(player.game, {
		cmd: 'joinGame', 
		player: player.serialize()
	}, player);
};

exports.leaveGame = function(player) {
	sendAll(player.game, {
		cmd: 'leaveGame', 
		publicGuid: player.publicGuid
	}, player);
};


exports.init = function(socket) {
	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			switch (msg.cmd) {
				case 'startMove':
				case 'endMove':
					startEndMove(client.player, msg);
					break;
			}
		});
	});
};

