GameHandler = function(lobbyHandler, socketClient) {
	var game, player, factorialTimer;
	listeners = {};

	this.addListener = function(trigger, fn) {
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	this.removeBody = function(body) {
		game.removeBody(body);
	};

	this.startGame = function(newGame, nick) {
		game = newGame;
		player = game.getPlayer(nick);
		factorialTimer = new FactorialTimer();
		factorialTimer.start(function(time) {
			game.world.step();
			_.each(listeners['step'], function(callback) {
				callback(time);
			});
		});
		_.each(listeners['startGame'], function(callback) {
			callback(game);
		});
	};

	this.startMove = function(cos, sin) {
		if (!player.dead) {
			player.direction = new OGE.Direction(cos, sin);
			socketClient.send('startMove', {
				cos: cos,
				sin: sin,
				x: player.x,
				y: player.y
			});
		}
	};

	this.endMove = function() {
		if (!player.dead) {
			player.direction = null;
			socketClient.send('endMove', {
				x: player.x,
				y: player.y
			});
		}
	};

	this.placeBomb = function() {
		if (!player.dead) {
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
		}
	};

	socketClient.addListener('joinGame', function(result, data) {
		p = Player.deserialize(data.player);
		game.addBody(p, true);

		_.each(listeners['addPlayer'], function(callback) {
			callback(p);
		});
	});

	socketClient.addListener('startMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = new OGE.Direction(data.cos, data.sin);
		p.x = data.x;
		p.y = data.y;
	});

	socketClient.addListener('endMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = null;
		p.x = data.x;
		p.y = data.y;
	});

	socketClient.addListener('logoutPlayer', function(result, data) {
		p = game.getPlayer(data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	socketClient.addListener('placeBomb', function(result, data) {
		var bomb = new Bomb(data.x, data.y, 16, 16);
		game.addBody(bomb);
		_.each(listeners['placeBomb'], function(callback) {
			callback(bomb);
		});
	});

	socketClient.addListener('explodeBomb', function(result, data) {
		var bomb = game.getBomb(data.x, data.y);
		game.getPlayer(data.player).bombs++;
		if (bomb !== null) {
			var data = game.explodeBomb(bomb);
			if (_.include(data.bodies, player)) {
				//player.dead = true;
				//game.removeBody(player);
				_.each(listeners['meDead'], function(callback) {
				//	callback(player);
				});
                player.x = 0;
                player.y = 0;
				socketClient.send('playerDead', {});
			}
			_.each(listeners['explodeBomb'], function(callback) {
				callback(bomb, data);
			});
		}
	});

	socketClient.addListener('playerDead', function(result, data) {
		var p = game.getPlayer(data.player);
		//game.removeBody(p);
        p.x = 0;
        p.y = 0;
		_.each(listeners['playerDead'], function(callback) {
			//callback(p);
		});
	});

	socketClient.addListener('resurectPlayer', function(result, data) {
		var p = game.getPlayer(data.player);
		game.addBody(p);
		_.each(listeners['resurectPlayer'], function(callback) {
			callback(p);
		});
	});
};

