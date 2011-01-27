var $infoArea;
var utils = {};
utils.log = function(cmd, msg) {
	if (arguments.length === 1) {
		msg = cmd;
		cmd = msg.cmd;
	}
	if (typeof console !== 'undefined' && console !== null) {
		console.log(cmd, msg);
	}
	msg = cmd + ' - ' + msg.result;
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
	$infoArea.attr('scrollTop', $infoArea.attr('scrollHeight'));
};

$(function() {
	$infoArea = $('#infoArea');
	var httpClient = new HttpClient(),
	socketClient = new SocketClient(),
	gameHandler = new GameHandler(lobbyHandler, socketClient),
	lobbyHandler = new LobbyHandler(gameHandler, httpClient, socketClient),
	gamePanel = new GamePanel(gameHandler),
	lobbyPanel = new LobbyPanel(lobbyHandler);
});

LobbyHandler = function(gameHandler, httpClient, socketClient) {
	var httpClient = new HttpClient(this),
	user;

	this.createGame = function(fn) {
		httpClient.createGame(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				gameHandler.startGame(game, user.nick);
				fn(true);
			} else {
				fn(fale);
			}
		});
	};

	this.playNow = function(fn) {
		httpClient.playNow(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				gameHandler.startGame(game, user.nick);
				fn(true);
			} else {
				fn(false);
			}
		});

	};

	this.login = function(nick, fn) {
		httpClient.login(nick, function(data) {
			if (data.result === 'OK') {
				user = data.data;
				socketClient.send('authPlayer', {
					guid: user.guid
				});
				fn(true);
			} else {
				fn(false);
			}
		});
	};
};

HttpClient = function() {
	var user;

	this.createGame = function(fn) {
		$.getJSON('/lobby?cmd=createGame&guid=' + user.guid, function(data) {
			utils.log('createGame', data);
			fn(data);
		});
	};

	this.playNow = function(fn) {
		$.getJSON('/lobby?cmd=joinGame&guid=' + user.guid, function(data) {
			utils.log('playNow', data);
            fn(data);
		});
	};

	this.login = function(nick, fn) {
		$.getJSON('/lobby?cmd=loginPlayer&nick=' + nick, function(data) {
			utils.log('loginPlayer', data);
			if (data.result === 'OK') {
				user = data.data;
			}
			fn(data);
		});
	};
};

LobbyPanel = function(lobbyHandler) {
	var $loginPanel = $('#loginPanel'),
	$loginButton = $('#loginButton'),
	$lobbyPanel = $('#lobbyPanel'),
	$nickField = $('#nickField'),
	$playNowButton = $('#playNowButton'),
	$createGameButton = $('#createGameButton');

	var init = function() {
		$nickField.keypress(function(e) {
			if (e.keyCode === 13) {
				$nickField.blur();
				login();
			}
		});
		$loginButton.click(function() {
			login();
		});

		$playNowButton.click(function() {
			playNow();
		});

		$createGameButton.click(function() {
			createGame();
		});

		$nickField.focus();
	};

	var showLobby = function() {
		$loginPanel.hide();
		$lobbyPanel.show();
	};

	var createGame = function() {
		lobbyHandler.createGame(function(result) {
			if (result) {
				$lobbyPanel.hide();
			}
		});
	};

	var playNow = function() {
		lobbyHandler.playNow(function(result) {
			$lobbyPanel.hide();
		});
	};

	var login = function() {
		if ($nickField.val().length > 0) {
			lobbyHandler.login($nickField.val(), function(result) {
				if (result) {
					showLobby();
				} else {
					$nickField.focus();
					$loginPanel.children('span').text('Nick taken!');
				}
			});
		}
	};

	init();
};

GameHandler = function(lobbyHandler, socketClient) {
	var game, player, factorialTimer;
	listeners = {};

	this.addListener = function(trigger, fn) {
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	this.removeBody = function(body) {
		game.removeBody(body);
	};

	this.startGame = function(newGame, nick) {
		game = newGame;
		player = game.getPlayer(nick);
		factorialTimer = new FactorialTimer();
		factorialTimer.start(function(time) {
			game.world.step();
			_.each(listeners['step'], function(callback) {
				callback(time);
			});
		});
		_.each(listeners['startGame'], function(callback) {
			callback(game);
		});
	};

	this.startMove = function(cos, sin) {
		if (!player.dead) {
			player.direction = new OGE.Direction(cos, sin);
			socketClient.send('startMove', {
				cos: cos,
				sin: sin,
				x: player.x,
				y: player.y
			});
		}
	};

	this.endMove = function() {
		if (!player.dead) {
			player.direction = null;
			socketClient.send('endMove', {
				x: player.x,
				y: player.y
			});
		}
	};

	this.placeBomb = function() {
		if (!player.dead) {
			if (player.bombs > 0) {
				player.bombs--;
				var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
				game.addBody(bomb);
				bomb.power = player.power;
				socketClient.send('placeBomb', {
					x: bomb.x,
					y: bomb.y
				});
				return bomb;
			}
		}
	};

	socketClient.addListener('joinGame', function(result, data) {
		p = Player.deserialize(data.player);
		game.addBody(p, true);

		_.each(listeners['addPlayer'], function(callback) {
			callback(p);
		});
	});

	socketClient.addListener('startMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = new OGE.Direction(data.cos, data.sin);
		p.x = data.x;
		p.y = data.y;
	});

	socketClient.addListener('endMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = null;
		p.x = data.x;
		p.y = data.y;
	});

	socketClient.addListener('logoutPlayer', function(result, data) {
		p = game.getPlayer(data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	socketClient.addListener('placeBomb', function(result, data) {
		var bomb = new Bomb(data.x, data.y, 16, 16);
		game.addBody(bomb);
		_.each(listeners['placeBomb'], function(callback) {
			callback(bomb);
		});
	});

	socketClient.addListener('explodeBomb', function(result, data) {
		var bomb = game.getBomb(data.x, data.y);
		game.getPlayer(data.player).bombs++;
		if (bomb !== null) {
			var data = game.explodeBomb(bomb);
			if (_.include(data.bodies, player)) {
				//player.dead = true;
				//game.removeBody(player);
				_.each(listeners['meDead'], function(callback) {
				//	callback(player);
				});
                player.x = 0;
                player.y = 0;
				socketClient.send('playerDead', {});
			}
			_.each(listeners['explodeBomb'], function(callback) {
				callback(bomb, data);
			});
		}
	});

	socketClient.addListener('playerDead', function(result, data) {
		var p = game.getPlayer(data.player);
		//game.removeBody(p);
        p.x = 0;
        p.y = 0;
		_.each(listeners['playerDead'], function(callback) {
			//callback(p);
		});
	});

	socketClient.addListener('resurectPlayer', function(result, data) {
		var p = game.getPlayer(data.player);
		game.addBody(p);
		_.each(listeners['resurectPlayer'], function(callback) {
			callback(p);
		});
	});
};

SocketClient = function() {
	var client = new io.Socket(),
	listeners = {};

	this.addListener = function(trigger, fn) {
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	this.send = function(cmd, data) {
		client.send({
			cmd: cmd,
			data: data
		});
	};

	client.connect();
	client.on('message', function(msg) {
		utils.log(msg);
		_.each(listeners[msg.cmd], function(fn) {
			fn(msg.result, msg.data);
		});
	});
};

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

KeyboardHandler = function() {
	var keyCode, keydown, keyup;

	this.keydown = function(callback) {
		keydown = callback;
		return this;
	};

	this.keyup = function(callback) {
		keyup = callback;
		return this;
	};

	$(document).keydown(function(e) {
		var dir = null;
		switch (e.keyCode) {
		case 32:
			dir = 'space';
			break;
		case 37:
		case 65:
			dir = 'left';
			break;
		case 38:
		case 87:
			dir = 'up';
			break;
		case 39:
		case 68:
			dir = 'right';
			break;
		case 40:
		case 83:
			dir = 'down';
			break;
		}
		if (dir !== null) {
			if (keyCode !== e.keyCode) {
				keyCode = e.keyCode;
				keydown(dir);
			}
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	}).keyup(function(e) {
		if (e.keyCode === keyCode) {
			keyCode = 0;
			keyup();
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
		}
	});
};

FactorialTimer = function() {
	var time = new Date().getTime(),
	lastTime = 0,
	sleepTime = 50,
	callback;

	this.start = function(callbackFn) {
		callback = callbackFn;
		step();
	};

	var step = function() {
		time = Math.floor((new Date().getTime() - time) * 0.9 + lastTime * 0.1);
		lastTime = time;
		if (time > 50 && sleepTime > 45) {
			sleepTime--;
		} else if (time < 50 && sleepTime < 55) {
			sleepTime++;
		}
		callback(time);

		time = new Date().getTime();

		setTimeout(step, sleepTime);
	};
};

