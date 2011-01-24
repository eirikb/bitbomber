GameClient = function(game, nick) {
	var player = game.getPlayer(nick);
	var $gamePanel = $('#gamePanel'),
	$fpsLabel = $('#fpsLabel');
	var keyCode = 0;

	client.on('message', function(msg) {
		if (msg.result === 'OK') {
			switch (msg.cmd) {
			case 'joinGame':
				var p = Player.deserialize(msg.data.player);
				game.addBody(p, true);
				addPlayer(p);
				break;
			case 'startMove':
				var p = game.getPlayer(msg.data.player);
				p.direction = new OGE.Direction(msg.data.cos, msg.data.sin);
				p.x = msg.data.x;
				p.y = msg.data.y;
				break;
			case 'endMove':
				var p = game.getPlayer(msg.data.player);
				p.direction = null;
				p.x = msg.data.x;
				p.y = msg.data.y;
				break;
			case 'logoutPlayer':
				var p = game.getPlayer(msg.data.player);
				p.$img.remove();
				game.removeBody(p);
				break;
			case 'placeBomb':
				var bomb = new Bomb(msg.data.x, msg.data.y, 16, 16);
				placeBomb(bomb);
				break;
			}
		}
	});

	var addBody = function(body, image) {
		var $img = $('<img>').
		attr('src', 'images/' + image + '.png').
		css('left', body.x).
		css('top', body.y).
		addClass('body');
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
		game.addBody(bomb);
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

	var init = function() {
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

		$(document).keydown(function(e) {
			var cos = 0,
			sin = 0,
			prevent = false;
			switch (e.keyCode) {
			case 32:
				if (player.bombs > 0) {
					player.bombs--;
					var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
					bomb.power = player.power;
					placeBomb(bomb);
					client.send({
						cmd: 'placeBomb',
						data: {
							x: bomb.x,
							y: bomb.y
						}
					});
				}
				prevent = true;
				break;
			case 37:
			case 65:
				cos = - 1;
				break;
			case 38:
			case 87:
				sin = - 1;
				break;
			case 39:
			case 68:
				cos = 1;
				break;
			case 40:
			case 83:
				sin = 1;
				break;
			}
			if (cos !== 0 || sin !== 0) {
				if (keyCode !== e.keyCode) {
					keyCode = e.keyCode;
					player.direction = new OGE.Direction(cos, sin);
					client.send({
						cmd: 'startMove',
						data: {
							cos: cos,
							sin: sin,
							x: player.x,
							y: player.y
						}
					});
				}
				prevent = true;
			}
			if (prevent) {
				e.stopPropagation();
				e.preventDefault();
				return false;
			}

		}).keyup(function(e) {
			if (e.keyCode === keyCode) {
				keyCode = 0;
				player.direction = null;
				client.send({
					cmd: 'endMove',
					data: {
						x: player.x,
						y: player.y
					}
				});
			}
		}).keypress(function(e) {
			switch (e.keyCode) {
			case 32:
			case 37:
			case 38:
			case 39:
			case 40:
				e.stopPropagation();
				e.preventDefault();
				return false;
				break;
			}
		});

		var time = new Date().getTime();
		var lastTime = 0;
		var sleepTime = 50;
		var frame = 0;
		var step = function() {
			time = Math.floor((new Date().getTime() - time) * 0.9 + lastTime * 0.1);
			lastTime = time;
			if (time > 50 && sleepTime > 45) {
				sleepTime--;
			} else if (time < 50 && sleepTime < 55) {
				sleepTime++;
			}

			if (++frame === 20) {
				$fpsLabel.text('Time: ' + time + '(' + sleepTime + ')');
				frame = 0;
			}
			time = new Date().getTime();

			game.world.step();
			$.each(game.players, function(i, p) {
				animatePlayer(p);
			});
			$.each(game.bombs, function(i, b) {
				animateBomb(b);
			});

			setTimeout(step, sleepTime);
		};

		step();

	};

	init();
};

