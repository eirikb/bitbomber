var players = require('players'),
bitbomber = require('bitbomber'),
ingame = require('ingame'),
openGames = {};

exports.createGame = function() {
	var game = new Game(640, 480).createBlocks(16).createBricks(16, 20);
	game.guid = guid();
	openGames[game.guid] = game;
	return game;
};

exports.playNow = function(player) {
	var games = Object.keys(openGames),
	game;
	if (games.length > 0) {
		game = openGames[games[Math.floor(Math.random() * games.length)]];
	} else {
		game = this.createGame();
	}
	player.x = 0;
	player.y = 0;
	switch (game.players.length) {
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
	//ingame.joinGame(player);
	player.game = game;
	player.client.send({
		cmd: 'joinGame', 
		game: game.serialize()
	});
};

exports.init = function(socket) {
	var self = this;
	socket.on('connection', function(client) {
		client.on('message', function(msg) {
			switch (msg.cmd) {
				case 'playNow':
					self.playNow(client.player);
					break;
			}
		});
		client.on('disconnect', function() {
			client.player.game && client.player.game.removeBody(client.player);
		});
	});
};