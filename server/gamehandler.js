var lobbyhandler = require('lobbyhandler'),
c = require('commons'),
_ = require('../lib/underscore/underscore'),
b = require('bomberman');

var bombs = [];
var bombGames = {};

exports.startBombTimer = function() {
	function checkBombs() {
		for (var i = 0; i < bombs.length; i++) {
			var bomb = bombs[i];
			console.log(bomb.x + ' - ' + bomb.y + ' - ' + bomb.timer);
			if (--bomb.timer === 0) {
				sendAll(bombGames[bomb], c.success('explodeBomb', {
					x: bomb.x,
					y: bomb.y
				}));
				bombs.splice(i, 1);
				delete bombGames[bomb];
                game.removeBody(bomb);
			}
		}
	};
	setInterval(checkBombs, 1000);
};

exports.playerLogout = function(cmd, player) {
	var g = b.playerGames[player.nick];
	if (c.isSet(g)) {
		g.removeBody(player);
		sendAll(g, c.success(cmd, {
			player: player.nick
		}));
		if (g.players.length == 0) {
			delete b.games[g.guid];
			delete b.openGames[g.guid];
			c.log('Game deleted ' + g.guid);
		}
	}
};

exports.createGame = function(cmd, player) {
	var guid = c.guid;
	if (!c.isSet(b.games[guid])) {
		var game = new Game(640, 480).createBlocks(16).createBricks(16, 20);
		var guid = c.guid();
		game.guid = guid;
		b.games[guid] = game;
		b.openGames[guid] = game;
		b.playerGames[player.nick] = game;
		game.addBody(player, true);
		c.log('Player ' + player.nick + ' created game ' + guid);
		var data = game.serialize();
		return c.success(cmd, game.serialize());
	} else {
		return c.error(cmd, 1, 'GUID TAKEN');
	}
};

exports.joinGame = function(cmd, player) {
	var games = _.keys(b.openGames);
	if (games.length > 0) {
		var i = Math.floor(Math.random() * games.length);
		var g = b.openGames[games[Math.floor(Math.random() * games.length)]];
		var x = 0,
		y = 0;
		switch (g.players.length) {
		case 1:
		case 3:
			x = g.world.width - player.width;
			break;
		case 2:
		case 3:
			y = g.world.height - player.height;
			break;
		}
		player.x = x;
		player.y = y;
		if (g.addBody(player, true)) {
			b.playerGames[player.nick]  = g;
			c.log('Player ' + player.nick + ' join game ' + g.guid);
			sendAll(g, c.success('joinGame', {
				player: player.serialize()
			}), player);
			return c.success(cmd, g.serialize());
		} else {
			c.log('Player ' + player.nick + ' unable to join game ' + g.guid);
			return c.error(cmd, 2, 'GAME CLOSED');
		}

	} else {
		return c.error(cmd, 1, 'NO OPEN GAMES');
	}
};

var sendAll = function(game, msg, excludePlayer) {
	_.each(game.players, function(player) {
		if (!excludePlayer || player.nick !== excludePlayer.nick) {
			b.playerClients[player.nick].send(msg);
		}
	});
};

exports.authPlayer = function(cmd, client, guid) {
	var player = b.playerGuids[guid];
	if (c.isSet(player)) {
		b.playerClients[player.nick] = client;
		b.sessionPlayers[client.sessionId] = player;
		client.send(c.success(cmd, player));
	} else {
		client.send(c.error(cmd, 0, 'UNKOWN GUID'));
	}

};

exports.startGame = function(cmd, client, player, game) {
	if (c.isSet(game) && game.owner === player) {
		delete b.openGames[game.guid];
		c.log('IO: ' + player.nick + ' STARTED GAME');
		sendAll(game, c.success(cmd));
	} else {
		c.log('IO: ' + player.nick + ' TRIED TO START GAME');
		client.send(c.error(cmd, 0, 'NOT OWNER'));
	};
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
	bombGames[bomb]  = game;
	sendAll(game, c.success(cmd, {
		x: x,
		y: y,
		power: player.power
	}), player);
};

