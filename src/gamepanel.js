GamePanel = function(gameHandler) {
	var $gamePanel = $('#gamePanel'),
	$fpsLabel = $('#fpsLabel'),
	keyboardHandler,
	fires = [],
	firebricks = [];

	gameHandler.addListener('startGame', function(game) {
		keyboardHandler = new KeyboardHandler();

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
			}
		}).keyup(function(e) {
			gameHandler.endMove();
		});

		var frame = 0;
		gameHandler.addListener('step', function(time, fps, gameTime) {
			var visualTime = new Date().getTime();
			$.each(game.players, function(i, p) {
				if (p.animate === 0 && p.direction !== null && p.speed > 0) {
					p.animate = 5;
					p.sprite = 0;
				} else if (p.animate > 0 && p.direction === null || p.speed === 0) {
					p.animate = 0;
				}
				animateBody(p);
			});
			$.each(game.bombs, function(i, b) {
				animateBody(b);
			});
			$.each(fires, function(i, f) {
				animateBody(f);
				if (f.sprite === f.sprites.length - 1 && f.animate === 1) {
					fires = _.without(fires, f);
					f.$img.remove();
				}
			});
			$.each(firebricks, function(i, b) {
				animateBody(b);
			});
			if (++frame === 20) {
				visualTime = new Date().getTime() - visualTime;
				$fpsLabel.text('Total time: ' + time + '. Engine time: ' + gameTime + '. Drawing time: ' + visualTime + ' . fps: ' + fps);
				frame = 0;
			}
		});

		gameHandler.addListener('explodeBomb', function(bomb, data) {
			bomb.$img.remove();
			_.each(data.fires, function(fire) {
				var os = 0,
				f = fire.firevar;
				switch (f) {
				case 'l':
					os = 2;
					break;
				case 'r':
					os = 3;
					break;
				case 'u':
					os = 4;
					break;
				case 'd':
					os = 1;
					break;
				case 'h':
					os = 5;
					break;
				case 'v':
					os = 6;
					break;
				}
				fire.direction = null,
				fire.sprites = [0, 1, 2, 3];
				addBody(fire, 'fires');
				fire.animate = 5;
				fire.offsetSprite = os;
				fire.maxAnimate = 1;
				fires.push(fire);
			});
			_.each(data.bodies, function(body) {
				if (body instanceof Box && body.armor === bomb.power) {
					body.animate = 0;
					body.sprite = 0;
					firebricks.push(body);
				} else if (body instanceof Bomb) {
					body.$img.remove();
				}
			});
		});
	});

	gameHandler.addListener('addPlayer', function(player) {
		addPlayer(player);
	});

	gameHandler.addListener('placeBomb', function(bomb) {
		placeBomb(bomb);
	});

	gameHandler.addListener('meDead', function(player) {
		player.$img.remove();
	});

	gameHandler.addListener('playerDead', function(player) {
		player.$img.remove();
	});

	gameHandler.addListener('resurectPlayer', function(player) {
		$gamePanel.append(player.$img);
	});

	var addBody = function(body, image) {
		var $img = $('<div>').css('background', 'url(images/' + image + '.png)').css('left', body.x).css('top', body.y).addClass('body');
		$gamePanel.append($img);
		body.$img = $img;
		body.sprite = 0;
		body.offsetSprite = 0;
		body.animate = 0;
		body.animateCount = 0;
		return $img;
	};

	var addPlayer = function(player) {
		addBody(player, 'pb').addClass('player');
		player.sprites = [0, 1, 0, 2];
	};

	var placeBomb = function(bomb) {
		addBody(bomb, 'objects');
		bomb.sprites = [0, 1, 2];
		bomb.animate = 5;
		bomb.offsetSprite = 2;
	};

	var animateBody = function(b) {
		if (b.direction !== null && b.speed > 0) {
			b.$img.css('left', b.x).css('top', b.y - 4);
		}
		if (b.animate > 0) {
			if (b.lastDirection !== b.direction) {
				b.animate = 0;
				b.lastDirection = b.direction;
			}
			if (--b.animate <= 0) {
				b.animate = 5;
				if (++b.sprite >= b.sprites.length) {
					b.sprite = 0;
				}
				var d = 0;
				if (b.direction !== null) {
					if (b.direction.cos !== 0) {
						d = b.direction.cos > 0 ? 3: 2;
					} else if (b.direction.sin !== 0) {
						d = b.direction.sin > 0 ? 0: 1;
					}
				}
				b.$img.css('background-position', ( - (18 * (d + b.offsetSprite))) + 'px ' + ( - (22 * b.sprites[b.sprite])) + 'px');
			}
		}
	};
};

