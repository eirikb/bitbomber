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
			_.each(listeners['explodeBomb'], function(callback) {
				callback(bomb, data);
			});
		}
	});
};

