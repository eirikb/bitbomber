GameClient = function(game, nick) {
	var player = game.getPlayer(nick);
	var $gamePanel = $('#gamePanel'),
	$fpsLabel = $('#fpsLabel');
	var bodyImages = {};
	var keyCode = 0;

	client.on('message', function(msg) {
		if (msg.result === 'OK') {
			switch (msg.cmd) {
			case 'joinGame':
				var p = Player.deserialize(msg.data.player);
				game.addBody(p, true);
				addBody(p, 'pl1');
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
		if (body.nick) {
			bodyImages[body.nick] = $img;
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
			addBody(p, 'pl1');
		});

		$(document).keydown(function(e) {
			var cos = 0,
			sin = 0;
			switch (e.keyCode) {
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
				var $img = bodyImages[p.nick];
				$img.css('left', p.x).css('top', p.y - 4);
			});

			setTimeout(step, sleepTime);
		};

		step();

	};

	init();
};

