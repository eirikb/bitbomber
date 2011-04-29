GameHandler = function() {
	var gamePanel = new GamePanel(this),
	game,
	bombs = {},
	$lobbyPanel = $('#lobbyPanel'),
	$gamePanel = $('#gamePanel'),
	keyboardHandler = new KeyboardHandler();

	now.game = function(gameData) {
		var player = bitbomber.player;
		game = Game.deserialize(gameData, player);
		utils.log(game.players);
		$gamePanel.show();
		$lobbyPanel.hide();
		gamePanel.startGame(game);
		keyboardHandler.init();
	}

	now.joinGame = function(playerData) {
		var player = Player.deserialize(playerData);
		game.addBody(player, true);
		gamePanel.addPlayer(player);
	}

	now.leaveGame = function(publicGuid) {
		var player = game.getPlayer(publicGuid);
		if (player !== null) {
			gamePanel.removePlayer(player);
			game.removeBody(player);
		}
	}

	now.move = function(publicGuid, direction, x, y, hack) {
        if (hack || publicGuid !== bitbomber.player.publicGuid) {
            var player = game.getPlayer(publicGuid);
            player.direction = direction !== null ? OGE.Direction.deserialize(direction) : null;
            player.x = x;
            player.y = y;
            if (direction !== null) {
                gamePanel.startMove(player, direction.dir);
            } else {
                gamePanel.endMove(player);
            }
        }
	};

	now.addBomb = function(bombData) {
		var bomb = Bomb.deserialize(bombData);
		bombs[bomb.guid] = bomb;
		game.addBody(bomb);
		gamePanel.addBomb(bomb);
	};

	now.explodeBomb = function(bombGuid) {
		var bomb = bombs[bombGuid];
		if (bomb) {
			var data = game.explodeBomb(bomb);
			game.removeBodies(data.bombs, Bomb);
			gamePanel.explodeBomb(data);
		}
	}

	this.step = function() {
		game.world.step();
	};

	this.removeBody = function(body) {
		game.removeBody(body);
	};

	keyboardHandler.keydown(function(dir) {
		var cos = 0,
		sin = 0;
		switch (dir) {
			case 'space':
				now.placeBomb(bitbomber.player.x, bitbomber.player.y);
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
			var player = bitbomber.player,
			direction = new OGE.Direction(cos, sin).serialize();
			direction.dir = dir;
			now.startEndMove(direction, player.x, player.y);
			now.move(player.publicGuid, direction, player.x, player.y, true);
		}
	}).keyup(function() {
		var player = bitbomber.player;
		now.startEndMove(null, player.x, player.y);
		now.move(player.publicGuid, null, player.x, player.y, true);
	});
};