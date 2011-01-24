GameHandler = function(bomberman) {
	var gamePanel = new GamePanel(this),
	gameClient = new GameClient(),
	game,
	player;

	this.startGame = function(newGame, nick) {
		game = newGame;
		player = game.getPlayer(nick);
		gamePanel.startGame(game);
	};

	this.login = function(guid) {
		gameClient.send('authPlayer', {
			guid: guid
		});
	};

	this.step = function() {
		game.world.step();
	};

	this.startMove = function(cos, sin) {
		player.direction = new OGE.Direction(cos, sin);
		gameClient.send('startMove', {
			cos: cos,
			sin: sin,
			x: player.x,
			y: player.y
		});
	};

	this.endMove = function() {
		player.direction = null;
		gameClient.send('endMove', {
			x: player.x,
			y: player.y
		});
	};

	this.placeBomb = function() {
		if (player.bombs > 0) {
			player.bombs--;
			var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
			bomb.power = player.power;
			gameClient.send('placeBomb', {
				x: bomb.x,
				y: bomb.y
			});
			return bomb;
		}
	};

	gameClient.addListener('joinGame', function(data) {
		p = Player.deserialize(msg.data.player);
		game.addBody(p, true);
		addPlayer(p);
	});

	gameClient.addListener('startMove', function(data) {
		p = game.getPlayer(msg.data.player);
		p.direction = new OGE.Direction(msg.data.cos, msg.data.sin);
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	gameClient.addListener('endMove', function(data) {
		p = game.getPlayer(msg.data.player);
		p.direction = null;
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	gameClient.addListener('logoutPlayer', function(data) {
		p = game.getPlayer(msg.data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	gameClient.addListener('placeBomb', function(data) {
		var bomb = new Bomb(msg.data.x, msg.data.y, 16, 16);
		placeBomb(bomb);
	});

};

