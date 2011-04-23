var bitbomber = require('bitbomber'),
bombs = [];

exports.startBombTimer = function() {
	function checkBombs() {
		for (var i = 0; i < bombs.length; i++) {
			var bomb = bombs[i];
			console.log(bomb.x + ' - ' + bomb.y + ' - ' + bomb.timer);
			if (--bomb.timer === 0) {
				var data = {
					player: bomb.player.nick,
					x: bomb.x,
					y: bomb.y
				};

				sendAll(bomb.game, c.success('explodeBomb', data));
				bomb.game.removeBody(bomb);
				bombs.splice(i, 1);
			}
		}
	};
	setInterval(checkBombs, 1000);
};

exports.playerLogout = function(cmd, player, game) {
	sendAll(game, c.success(cmd, {
		player: player.nick
	}));
};

exports.joinGame = function(cmd, player, game) {
	sendAll(game, c.success(cmd, {
		player: player.serialize()
	}), player);
};

var sendAll = function(game, msg, excludePlayer) {
	_.each(game.players, function(player) {
		if (!excludePlayer || player.nick !== excludePlayer.nick) {
			b.playerClients[player.nick].send(msg);
		}
	});
};

exports.startGame = function(cmd, game) {
	sendAll(game, c.success(cmd));
};

exports.endMove = function(cmd, player, game, data) {
	var x = parseInt(data.x, 10);
	var y = parseInt(data.y, 10);
	player.x = x;
	player.y = y;
	sendAll(game, c.success(cmd, {
		x: x,
		y: y,
		player: player.nick
	}), player);
};

exports.startMove = function(cmd, player, game, data) {
	var cos = parseInt(data.cos, 10);
	var sin = parseInt(data.sin, 10);
	var x = parseInt(data.x, 10);
	var y = parseInt(data.y, 10);
	player.x = x;
	player.y = y;
	sendAll(game, c.success(cmd, {
		cos: cos,
		sin: sin,
		x: x,
		y: y,
		player: player.nick
	}), player);
};

exports.placeBomb = function(cmd, player, game, data) {
	var x = parseInt(data.x);
	var y = parseInt(data.y);
	var bomb = new Bomb(x, y, 16, 16);
	game.addBody(bomb);
	bombs.push(bomb);
	bomb.game = game;
	bomb.player = player;
	sendAll(game, c.success(cmd, {
		x: x,
		y: y,
		power: player.power
	}), player);
};

exports.playerDead = function(cmd, player, game, data) {
	sendAll(game, c.success(cmd, {
		player: player.nick
	}), player);
};

exports.resurectPlayer = function(cmd, player, game, data) {
	sendAll(game, c.success(cmd, {
		player: player.nick
	}));
};

