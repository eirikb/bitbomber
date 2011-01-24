GamePanel = function(gameHandler) {
	var $gamePanel = $('#gamePanel'),
	$fpsLabel = $('#fpsLabel'),
	keyboardHandler,
	factorialTimer;

	this.startGame = function(game) {
		keyboardHandler = new KeyboardHandler();
		factorialTimer = new FactorialTimer();

		$gamePanel.find('*').remove();
		$gamePanel.show();

		$gamePanel.width(game.world.width).height(game.world.height);

		$.each(game.blocks, function(i, block) {
			addBody(block, 'block');
		});

		$.each(game.bricks, function(i, brick) {
			addBody(brick, 'brick');
		});

		$.each(game.players, function(i, p) {
			addPlayer(p);
		});

		keyboardHandler.keydown(function(dir) {
			var cos = 0,
			sin = 0;
			switch (dir) {
			case 'space':
				var bomb = gameHandler.placeBomb();
				placeBomb(bomb);
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
			}
		}).keyup(function(e) {
			gameHandler.endMove();
		});

		var frame = 0;
		factorialTimer.start(function(time) {
			gameHandler.step();
			if (++frame === 20) {
				$fpsLabel.text('Time: ' + time);
				frame = 0;
			}
			$.each(game.players, function(i, p) {
				animatePlayer(p);
			});
			$.each(game.bombs, function(i, b) {
				animateBomb(b);
			});
		});
	};

	var addBody = function(body, image) {
		var $img = $('<img>').attr('src', 'images/' + image + '.png').css('left', body.x).css('top', body.y).addClass('body');
		$gamePanel.append($img);
		body.$img = $img;
	};

	var addPlayer = function(player) {
		addBody(player, 'pl1');
		player.animate = 0;
		player.sprite = 0;
		player.sprites = [1, 2, 1, 3];
	};

	var placeBomb = function(bomb) {
		bomb.animate = 0;
		bomb.sprite = 0;
		bomb.sprites = [1, 2, 3];
		addBody(bomb, 'bomb1');
	};

	var animatePlayer = function(p) {
		p.$img.css('left', p.x).css('top', p.y - 4);
		if (p.direction !== null && p.speed > 0) {
			if (p.lastDirection !== p.direction) {
				p.animate = 0;
				p.lastDirection = p.direction;
			}
			if (--p.animate < 0) {
				p.animate = 5;
				if (++p.sprite >= p.sprites.length) {
					p.sprite = 0;
				}
				var d;
				if (p.direction.cos !== 0) {
					d = p.direction.cos > 0 ? 'r': 'l';
				} else if (p.direction.sin !== 0) {
					d = p.direction.sin > 0 ? 'd': 'u';
				}
				p.$img.attr('src', '/images/p' + d + p.sprites[p.sprite] + '.png');
			}

		}
	};

	var animateBomb = function(b) {
		if (--b.animate < 0) {
			b.animate = 5;
			if (++b.sprite >= b.sprites.length) {
				b.sprite = 0;
			}
			b.$img.attr('src', '/images/bomb' + b.sprites[b.sprite] + '.png');
		}
	};
};

