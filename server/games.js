var players = require('players'),
nowjs = require('now'),
Game = require('game'),
openGames = {};

var createGame = function() {
	var game = new Game(640, 480).createBlocks(16).createBricks(16, 20),
	gguid = guid();
	while (openGames[gguid]) {
		gguid = guid();
	}
	game.guid = gguid;
	game.spots = [null, null, null, null];
	openGames[game.guid] = game;
	return game;
};

var getRandomGame = function() {
	var games = Object.keys(openGames);
	if (games.length > 0) {
		return openGames[games[Math.floor(Math.random() * games.length)]];
	} else {
		return createGame();
	}
};

var addPlayerToGame = function(game, player) {
	var pos = game.spots.indexOf(null);
	game.spots[pos] = player;
	player.color = pos;
	player.x = 0;
	player.y = 0;
	switch (pos) {
		case 1:
		case 3:
			player.x = game.world.width - player.width;
			break;
		case 2:
		case 3:
			player.y = game.world.height - player.height;
			break;
	}

	var group = nowjs.getGroup(game.guid);
	group.now.joinGame && group.now.joinGame(player.serialize());
	group.addUser(player.clientId);

	game.addBody(player, true);
	player.game = game;
};

exports.playNow = function() {
	var player = players.getPlayer(this),
	game = getRandomGame();
	addPlayerToGame(game, player);
	this.now.game(game.serialize());
};

exports.logout = function(clientId) {
	var player = players.getPlayer(clientId);
	if (player.game) {
		nowjs.getGroup(player.game.guid).now.leaveGame(player.publicGuid);
		var pos = player.game.spots.indexOf(player);
		player.game.spots[pos] = null;
		player.game.removeBody(player);
		player.game = null;
	}
};