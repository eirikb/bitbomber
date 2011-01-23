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
				console.log('test', game.players);
				break;
			case 'startMove':
				var p = game.getPlayer(msg.data.player);
				p.direction = new OGE.Direction(msg.data.cos, msg.data.sin);
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
				cos = - 1;
				break;
			case 38:
				sin = - 1;
				break;
			case 39:
				cos = 1;
				break;
			case 40:
				sin = 1;
				break;
			}
			if (cos !== 0 || sin !== 0) {
				keyCode = e.keyCode;
				player.direction = new OGE.Direction(cos, sin);
				client.send({
					cmd: 'startMove',
					data: player.direction
				});
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		}).keyup(function(e) {
			if (e.keyCode === keyCode) {
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
		var lastFrame = 1;
		var sleepTime = 0;
		var frame = 0;
		var step = function() {
			time = (new Date().getTime() - time) * 0.9 + lastFrame * 0.1
			var fps = Math.floor(1000 / time);
			lastFrame = time;
			time = new Date().getTime();
			if (++frame === 10) {
				$fpsLabel.text('FPS: ' + fps);
				frame = 0;
			}

			game.world.step();
			$.each(game.players, function(i, p) {
				var $img = bodyImages[p.nick];
				$img.css('left', p.x).css('top', p.y - 4);
			});

			if (fps > 30) {
				sleepTime++;
			} else if (fps < 30) {
				sleepTime--;
			}

			setTimeout(step, sleepTime);
		};

		step();

	};

	init();
};

