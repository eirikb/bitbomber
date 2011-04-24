var ingame = require('ingame'),
openGames = {};

var createGame = function() {
	var game = new Game(640, 480).createBlocks(16).createBricks(16, 20);
	game.guid = guid();
	game.spots = [null, null, null, null];
	openGames[game.guid] = game;
	return game;
};

var playNow = function(player) {
	var games = Object.keys(openGames),
	game,
	pos = 0;
	if (games.length > 0) {
		game = openGames[games[Math.floor(Math.random() * games.length)]];
	} else {
		game = createGame();
	}
	pos = game.spots.indexOf(null);
	game.spots[pos] = player;
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
	game.addBody(player, true);
	player.game = game;
	ingame.joinGame(player);
	player.client.send({
		cmd: 'game', 
		game: game.serialize()
	});
};

var leaveGame = function(player) {
	if (player.game) {
		ingame.leaveGame(player);
		var pos = player.game.spots.indexOf(player);
		player.game.spots[pos] = null;
		player.game.removeBody(player);
		player.game = null;
	}
};

exports.init = function(socket) {
	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			switch (msg.cmd) {
				case 'playNow':
					playNow(client.player);
					break;
			}
		});
		client.on('disconnect', function() {
			leaveGame(client.player);
		});
	});
};