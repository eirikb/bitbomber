GameHandler = function(client) {
	var gamePanel = new GamePanel(this),
	game,
	$lobbyPanel = $('#lobbyPanel'),
	$gamePanel = $('#gamePanel'),
	keyboardHandler = new KeyboardHandler();

	function joinGame(gameData) {
		var player = bitbomber.player;
		game = Game.deserialize(gameData, player);
		utils.log(game.players.length);
		$gamePanel.show();
		$lobbyPanel.hide();
		gamePanel.startGame(game);
		keyboardHandler.init();
	}

	function startMove(cos, sin) {
		var player = bitbomber.player;
		if (!player.dead) {
			player.direction = new OGE.Direction(cos, sin);
			client.send('startMove', {
				cos: cos,
				sin: sin,
				x: player.x,
				y: player.y
			});
		}
	};

	function endMove() {
		var player = bitbomber.player;
		if (!player.dead) {
			player.direction = null;
			client.send('endMove', {
				x: player.x,
				y: player.y
			});
		}
	};

	this.step = function() {
		game.world.step();
	};

	keyboardHandler.keydown(function(dir) {
		var cos = 0,
		sin = 0;
		switch (dir) {
			case 'space':
				var bomb = gameHandler.placeBomb();
				if ( !! bomb) {
					placeBomb(bomb);
				}
				break;
			case 'left':
				cos = - 1;
				break;
			case 'up':
				sin = - 1;
				break;
			case 'right':
				cos = 1;
				break;
			case 'down':
				sin = 1;
				break;
		}
		if (cos !== 0 || sin !== 0) {
			startMove(cos, sin);
			gamePanel.startMove(dir);
		}
	}).keyup(function(e) {
		endMove();
		gamePanel.endMove();
	});

	client.on('message', function(msg) {
		switch (msg.cmd) {
			case 'joinGame':
				joinGame(msg.game);
				break;
		}
	});
};
/*

	this.placeBomb = function() {
		if (!player.dead) {
			if (player.bombs > 0) {
				//player.bombs--;
				var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
				bomb.size = 10;
				bomb.power = player.power;
				bomb.power = 1;
				game.addBody(bomb);
				socketClient.send('placeBomb', {
					x: bomb.x,
					y: bomb.y
				});
				return bomb;
			}
		}
	};

	socketClient.addListener('joinGame', function(result, data) {
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
		_.each(listeners.placeBomb, function(callback) {
			callback(bomb);
		});
	});

	socketClient.addListener('explodeBomb', function(result, data) {
		var bomb = game.getBomb(data.x, data.y);
		game.getPlayer(data.player).bombs++;
		if (bomb !== null) {
			var eData = game.explodeBomb(bomb);
            game.removeBodies(eData.bombs, Bomb);
			if (_.include(eData.bodies, player)) {
				//player.dead = true;
				//game.removeBody(player);
				//_.each(listeners.meDead, function(callback) {
				//	callback(player);
				//});
                player.x = 0;
                player.y = 0;
				socketClient.send('playerDead', {});
			}
			_.each(listeners.explodeBomb, function(callback) {
				callback(bomb, eData);
			});
		}
	});

	socketClient.addListener('playerDead', function(result, data) {
		var p = game.getPlayer(data.player);
		//game.removeBody(p);
        p.x = 0;
        p.y = 0;
		_.each(listeners.playerDead, function(callback) {
			//callback(p);
		});
	});

	socketClient.addListener('resurectPlayer', function(result, data) {
		var p = game.getPlayer(data.player);
		game.addBody(p);
		_.each(listeners.resurectPlayer, function(callback) {
			callback(p);
		});
	});
    */

