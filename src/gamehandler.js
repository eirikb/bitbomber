GameHandler = function(lobbyHandler, socketClient) {
	var game, player, factorialTimer, onStep = [];

	this.startGame = function(newGame, nick) {
		game = newGame;
		player = game.getPlayer(nick);
		factorialTimer = new FactorialTimer();
		factorialTimer.start(function(time) {
			game.world.step();
			_.each(onStep, function(callback) {
				fn(time);
			});
		});
		gamePanel.startGame(game);
	};

	this.onStep = function(callback) {
		onStep.push(callback);
	};

	this.startMove = function(cos, sin) {
		player.direction = new OGE.Direction(cos, sin);
		socketClient.send('startMove', {
			cos: cos,
			sin: sin,
			x: player.x,
			y: player.y
		});
	};

	this.endMove = function() {
		player.direction = null;
		socketClient.send('endMove', {
			x: player.x,
			y: player.y
		});
	};

	this.placeBomb = function() {
		if (player.bombs > 0) {
			player.bombs--;
			var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
			bomb.power = player.power;
			socketClient.send('placeBomb', {
				x: bomb.x,
				y: bomb.y
			});
			return bomb;
		}
	};

	socketClient.addListener('joinGame', function(data) {
		p = Player.deserialize(msg.data.player);
		game.addBody(p, true);
		addPlayer(p);
	});

	socketClient.addListener('startMove', function(data) {
		p = game.getPlayer(msg.data.player);
		p.direction = new OGE.Direction(msg.data.cos, msg.data.sin);
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	socketClient.addListener('endMove', function(data) {
		p = game.getPlayer(msg.data.player);
		p.direction = null;
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	socketClient.addListener('logoutPlayer', function(data) {
		p = game.getPlayer(msg.data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	socketClient.addListener('placeBomb', function(data) {
		var bomb = new Bomb(msg.data.x, msg.data.y, 16, 16);
		placeBomb(bomb);
	});

};

