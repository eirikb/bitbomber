var bombs = [],
_ = require('underscore-min');

var bombTimer = function() {
	bombs.forEach(function(bomb) {
		if (--bomb.timer === 0) {
			bomb.game.removeBody(bomb);
			bomb.player.bombs++;
			sendAll(bomb.game, {
				cmd: 'explodeBomb', 
				bombGuid: bomb.guid
			});
			bombs = _.without(bombs, bomb);
		}
	});
};

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

var placeBomb = function(player) {
	if (!player.dead) {
		if (player.bombs > 0) {
			player.bombs--;
			var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
			bomb.guid = guid(5);
			bomb.size = 2;
			bomb.game = player.game;
			bomb.power = player.power;
			bomb.player = player;
			player.game.addBody(bomb);
			bombs.push(bomb);
			sendAll(player.game, {
				cmd: 'addBomb', 
				bomb: bomb.serialize()
			});
		}
	}
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
				case 'placeBomb':
					if (client.player) {
						client.player.x = parseInt(msg.x, 10);
						client.player.y = parseInt(msg.y, 10);
						placeBomb(client.player);
					}
					break;
			}
		});
	});

	setInterval(bombTimer, 1000);
};

