GameHandler = function(client) {
	var gamePanel = new GamePanel(this),
	game,
	bombs = {},
	$lobbyPanel = $('#lobbyPanel'),
	$gamePanel = $('#gamePanel'),
	keyboardHandler = new KeyboardHandler();

	function game(gameData) {
		var player = bitbomber.player;
		game = Game.deserialize(gameData, player);
		utils.log(game.players);
		$gamePanel.show();
		$lobbyPanel.hide();
		gamePanel.startGame(game);
		keyboardHandler.init();
	}

	function joinGame(playerData) {
		var player = Player.deserialize(playerData);
		game.addBody(player, true);
		gamePanel.addPlayer(player);
	}

	function leaveGame(publicGuid) {
		var player = game.getPlayer(publicGuid);
		if (player !== null) {
			gamePanel.removePlayer(player);
			game.removeBody(player);
		}
	}

	function startEndMove(data) {
		var player = game.getPlayer(data.publicGuid),
		cos = parseInt(data.cos),
		sin = parseInt(data.sin);
		if (!isNaN(cos) && !isNaN(sin)) {
			player.direction = new OGE.Direction(parseInt(data.cos, 10), parseInt(data.sin, 10));
			gamePanel.startMove(player, data.dir);
		} else {
			player.direction = null;
			gamePanel.endMove(player);
		}
		player.x = parseInt(data.x, 10);
		player.y = parseInt(data.y, 10);
	}

	function addBomb(bomb) {
		bombs[bomb.guid] = bomb;
		game.addBody(bomb);
		gamePanel.addBomb(bomb);
	}

	function placeBomb() {
		client.send({
			cmd: 'placeBomb', 
			x: bitbomber.player.x, 
			y:bitbomber.player.y
		});
	}

	function explodeBomb(bombGuid) {
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
				placeBomb();
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
			data = {
				cmd: 'startMove',
				dir: dir,
				cos: cos, 
				sin: sin, 
				x: player.x, 
				y: player.y
			};
			client.send(data);
			data.publicGuid = player.publicGuid;
			startEndMove(data);
		}
	}).keyup(function(e) {
		var player = bitbomber.player,
		data = {
			cmd: 'endMove',
			x: player.x, 
			y: player.y
		};
		client.send(data);
		data.publicGuid = player.publicGuid;
		startEndMove(data);
	});

	client.on('message', function(msg) {
		switch (msg.cmd) {
			case 'game':
				game(msg.game);
				break;
			case 'startMove':
			case 'endMove':
				startEndMove(msg);
				break;
			case 'joinGame':
				joinGame(msg.player);
				break;
			case 'leaveGame':
				leaveGame(msg.publicGuid);
				break;
			case 'addBomb':
				addBomb(Bomb.deserialize(msg.bomb));
				break;
			case 'explodeBomb':
				explodeBomb(msg.bombGuid);
				break;
		}
	});
};