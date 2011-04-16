GamePanel = function(gameHandler) {
	var $gamePanel = $('#gamePanel'),
	REFRESH_RATE = 30,
	keyboardHandler,
	lastDir,
	count = 0,
	playerAnimations = [],
	fireAnimations = [],
	playerAnimation = function(direction, color, type, numberOfFrame) {
		return new $.gameQuery.Animation({
			imageURL: 'images/players.png',
			numberOfFrame: numberOfFrame,
			delta: 22,
			rate: 120,
			type: $.gameQuery.ANIMATION_VERTICAL,
			offsetx: direction * 18 + color * (4 * 18),
			offsety: type * (3 * 22)
		});
	},
	addBody = function(body, name, animation, cb) {
        name += '-' + ++count;
		$('#background').addSprite(name, {
			animation: animation,
			width: 16,
			height: 16,
			posx: body.x,
			posy: body.y,
			callback: cb
		});
        body.name = name;
	},
	addBodies = function(bodies, name, animation) {
		_.each(bodies, function(b) {
			addBody(b, name, animation);
		});
	},
	blockSprite = new $.gameQuery.Animation({
		imageURL: 'images/objects.png'
	}),
	brickSprite = new $.gameQuery.Animation({
		imageURL: 'images/objects.png',
		offsetx: 18
	}),
	bombAnimation = new $.gameQuery.Animation({
		imageURL: 'images/objects.png',
		numberOfFrame: 3,
		delta: 22,
		rate: 120,
		offsetx: 2 * 18,
		type: $.gameQuery.ANIMATION_VERTICAL,
	}),
	fireAnimation = function(spriteX) {
		return new $.gameQuery.Animation({
			imageURL: 'images/fires.png',
			numberOfFrame: 4,
			delta: 22,
			rate: 120,
			type: $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK,
			offsetx: 18 * spriteX
		});
	},
	fireBrick = new $.gameQuery.Animation({
		imageURL: 'images/objects.png',
		numberOfFrame: 2,
		delta: 22,
		rate: 360,
		type: $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK,
		offsetx: 18,
		offsety: 22
	});

	playerAnimations['left'] = playerAnimation(2, 0, 0, 3);
	playerAnimations['left-idle'] = playerAnimation(2, 0, 0, 1);
	playerAnimations['up'] = playerAnimation(1, 0, 0, 3);
	playerAnimations['up-idle'] = playerAnimation(1, 0, 0, 1);
	playerAnimations['right'] = playerAnimation(3, 0, 0, 3);
	playerAnimations['right-idle'] = playerAnimation(3, 0, 0, 1);
	playerAnimations['down'] = playerAnimation(0, 0, 0, 3);
	playerAnimations['down-idle'] = playerAnimation(0, 0, 0, 1);

	fireAnimations['c'] = fireAnimation(0);
	fireAnimations['d'] = fireAnimation(1);
	fireAnimations['l'] = fireAnimation(2);
	fireAnimations['r'] = fireAnimation(3);
	fireAnimations['u'] = fireAnimation(4);
	fireAnimations['h'] = fireAnimation(5);
	fireAnimations['v'] = fireAnimation(6);

	gameHandler.addListener('startGame', function(game) {
		keyboardHandler = new KeyboardHandler();
		$gamePanel.playground({
			width: game.world.width,
			height: game.world.height,
			refreshRate: REFRESH_RATE
		}).addGroup('players').addGroup('background');
		_.each(game.players, function(player) {
			$('#players').addSprite("player", {
				animation: playerAnimations['down-idle'],
				width: 18,
				height: 22,
				posx: player.x,
				posy: player.y
			});
			$('#player')[0].player = player;
		});

		addBodies(game.blocks, 'block', blockSprite);
		addBodies(game.bricks, 'brick', brickSprite);

		$.playground().startGame(function() {}).registerCallback(function() {
			$('#player').each(function() {
				$(this).css('left', this.player.x).css('top', this.player.y - 6);
			});
			gameHandler.step();
		},
		REFRESH_RATE);

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
				gameHandler.startMove(cos, sin);
				$('#player').setAnimation(playerAnimations[dir]);
				lastDir = dir;
			}
		}).keyup(function(e) {
			gameHandler.endMove();
			$('#player').setAnimation(playerAnimations[lastDir + '-idle']);
		});
	});

	gameHandler.addListener('explodeBomb', function(bomb, data) {
		_.each(data.bombs, function(b) {
			$('#' + b.name).remove();
		});
		_.each(data.fires, function(fire) {
			addBody(fire, 'fire', fireAnimations[fire.firevar], function(e) {
				$(e).remove();
			});
		});
		_.each(data.bodies, function(body) {
			if (body instanceof Box) {
                console.log(body.name);
                $('#' + body.name).remove();
				addBody(body, 'firebrick', fireBrick, function(e) {
                    gameHandler.removeBody(body);
					$(e).remove();
				});
			}
		});
	});

	var placeBomb = function(bomb) {
		var name = 'bomb-' + ++count;
		$('#background').addSprite(name, {
			animation: bombAnimation,
			width: 16,
			height: 16,
			posx: bomb.x,
			posy: bomb.y
		});
		bomb.name = name;
	};
};

