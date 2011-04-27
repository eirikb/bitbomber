var bombs = [],
players = require('players'),
nowjs = require('now'),
OGE = require('oge'),
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

exports.startEndMove = function(direction, x, y) {
	var player = players.getPlayer(this);
	player.direction = direction !== null ? OGE.Direction.deserialize(direction) : null;
	player.x = x;
	player.y = y;
	nowjs.getGroup(player.game.guid).now.move(player.publicGuid, player.direction, x, y);
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

exports.init = function() {
	setInterval(bombTimer, 1000);
};

