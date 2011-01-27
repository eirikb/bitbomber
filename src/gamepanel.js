GamePanel = function(gameHandler, socketClient) {
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
		gameHandler.addListener('step', function(time) {
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
			$.each(fires, function(i, f) {
				animateFire(f);
			});
			$.each(firebricks, function(i, b) {
				animateFirebrick(b);
			});
		});

		gameHandler.addListener('explodeBomb', function(bomb, data) {
			bomb.$img.remove();
			for (var x = 0; x < data.fires.length; x++) {
				if (data.fires[x]) {
					for (var y = 0; y < data.fires[x].length; y++) {
						if (data.fires[x][y]) {
							var f = data.fires[x][y];
							if (f === 'l' || f === 'r') {
								f = 'h';
							} else if (f === 'u' || f === 'd') {
								f = 'v';
							}
							var $img = $('<img>').attr('src', 'images/f' + f + '1.png').css('left', x).css('top', y).addClass('body');
							fires.push({
								f: f,
								animate: 5,
								sprite: 1,
								$img: $img
							});
							$gamePanel.append($img);
						}
					}
				}
			}
			_.each(data.bodies, function(body) {
				if (body instanceof Box && body.armor === bomb.power) {
					body.animate = 0;
					body.sprite = 0;
					firebricks.push(body);
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

	var addBody = function(body, image) {
		var $img = $('<img>').attr('src', 'images/' + image + '.png').css('left', body.x).css('top', body.y).addClass('body');
		$gamePanel.append($img);
		body.$img = $img;
		return $img;
	};

	var addPlayer = function(player) {
		addBody(player, 'pl1').addClass('player');
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

	var animateFire = function(f) {
		if (--f.animate < 0) {
			f.animate = 5;
			if (++f.sprite > 4) {
				_.without(fires, f);
				f.$img.remove();
				return;
			}
			f.$img.attr('src', '/images/f' + f.f + f.sprite + '.png');
		}
	};

	var animateFirebrick = function(b) {
		if (--b.animate < 0) {
			b.animate = 5;
			if (++b.sprite > 2) {
				_.without(firebricks, b);
				gameHandler.removeBody(b);
				b.$img.remove();
				return;
			}
			b.$img.attr('src', '/images/fb' + b.sprite + '.png');
		}
	};
};

