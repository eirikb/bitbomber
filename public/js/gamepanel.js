GamePanel = function(gameHandler) {
	var $gamePanel = $('#gamePanel'),
	REFRESH_RATE = 30,
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
		$(bodies).each(function(i, body) {
			addBody(body, name, animation);
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
		type: $.gameQuery.ANIMATION_VERTICAL
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

	this.startGame = function(game) {
		$gamePanel.playground({
			width: game.world.width,
			height: game.world.height,
			refreshRate: REFRESH_RATE
		}).addGroup('players').addGroup('background');
		$(game.players).each(function(i, player) {
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

		$.playground().startGame().registerCallback(function() {
			$('#player').each(function() {
				$(this).css('left', this.player.x).css('top', this.player.y - 6);
			});
			gameHandler.step();
		},
		REFRESH_RATE);
	};

	this.explodeBomb = function(bomb, data) {
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
				$('#' + body.name).remove();
				addBody(body, 'firebrick', fireBrick, function(e) {
					gameHandler.removeBody(body);
					$(e).remove();
				});
			}
		});
	};

	this.startMove = function(dir) {
		$('#player').setAnimation(playerAnimations[dir]);
		lastDir = dir;
	};

	this.endMove = function() {
		$('#player').setAnimation(playerAnimations[lastDir + '-idle']);
	};

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

