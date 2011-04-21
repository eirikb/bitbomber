var players = require('players'),
c = require('commons'),
b = require('bitbomber'),
ingame = require('ingame');

exports.playerLogout = function(cmd, player) {
	var g = b.playerGames[player.nick];
	if (c.isSet(g)) {
		g.removeBody(player);
		ingame.playerLogout(cmd, player, g);
		if (g.players.length == 0) {
			delete b.games[g.guid];
			delete b.openGames[g.guid];
			c.log('Game deleted ' + g.guid);
		}
	}
};

exports.createGame = function(player) {
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
		return c.success(game.serialize());
	} else {
		return c.error(1, 'GUID TAKEN');
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
			b.playerGames[player.nick] = g;
			c.log('Player ' + player.nick + ' join game ' + g.guid);
			ingame.joinGame(cmd, player, g);
			return c.success(g.serialize());
		} else {
			c.log('Player ' + player.nick + ' unable to join game ' + g.guid);
			return c.error(2, 'GAME CLOSED');
		}

	} else {
		return this.createGame(player);
	}
};

exports.startGame = function(cmd, client, player, game) {
	if (c.isSet(game) && game.owner === player) {
		delete b.openGames[game.guid];
		c.log('IO: ' + player.nick + ' STARTED GAME');
		ingame.startGame(cmd, game);
	} else {
		c.log('IO: ' + player.nick + ' TRIED TO START GAME');
		client.send(c.error(cmd, 0, 'NOT OWNER'));
	};
};

