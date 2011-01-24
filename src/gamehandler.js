GameHandler = function(gameClient) {
	var gamePanel = new GamePanel(this);

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

