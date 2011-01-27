GameHandler = function(lobbyHandler, socketClient) {
	var game, player, factorialTimer;
	var onStep = [],
	onStartGame = [];

	this.onStep = function(callback) {
		onStep.push(callback);
	};

	this.onStartGame = function(callback) {
		onStartGame.push(callback);
	};

	this.startGame = function(newGame, nick) {
		game = newGame;
		player = game.getPlayer(nick);
		factorialTimer = new FactorialTimer();
		factorialTimer.start(function(time) {
			game.world.step();
			_.each(onStep, function(callback) {
				callback(time);
			});
		});
		_.each(onStartGame, function(callback) {
			callback(game);
		});
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
			game.addBody(bomb);
			bomb.power = player.power;
			socketClient.send('placeBomb', {
				x: bomb.x,
				y: bomb.y
			});
			return bomb;
		}
	};

	socketClient.addListener('joinGame', function(result, data) {
		p = Player.deserialize(data.player);
		game.addBody(p, true);
		addPlayer(p);
	});

	socketClient.addListener('startMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = new OGE.Direction(data.cos, data.sin);
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	socketClient.addListener('endMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = null;
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	socketClient.addListener('logoutPlayer', function(result, data) {
		p = game.getPlayer(data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	socketClient.addListener('placeBomb', function(result, data) {
		var bomb = new Bomb(data.x, data.y, 16, 16);
		placeBomb(bomb);
	});

	socketClient.addListener('explodeBomb', function(result, data) {
		var bomb = game.getBomb(data.x, data.y);
		if (bomb !== null) {
			var d = game.explodeBomb(bomb);
            console.log(d)
			for (var x = 0; x < d.fires.length; x++) {
                if (d.fires[x]) {
				for (var y = 0; y < d.fires[x].length; y++) {
					console.log(x, y, d.fires[x][y]);
				}
                }
			}

			game.removeBoxes(bomb, d);
		}
	});
};

