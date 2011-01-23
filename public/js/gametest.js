var player1, player2, player3, client1, client2, onMsg1, onMsg2, g1, g2;

$(function() {

	QUnit.init();

	asyncTest('create first player', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=player-1', function(data) {
			player1 = data.data;
			equal(player1.nick, 'player-1');
			start();
		});
	});

	asyncTest('create second player', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=player-2', function(data) {
			player2 = data.data;
			equal(player2.nick, 'player-2');
			start();
		});
	});

	asyncTest('create third player', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=player-3', function(data) {
			player3 = data.data;
			equal(player3.nick, 'player-3');
			start();
		});
	});

	asyncTest('auth client1', function() {
		client1 = new io.Socket();
		client1.connect();
		onMsg1 = function(msg) {
			equals(msg.result, 'OK');
			start();
		};
		client1.on('connect', function() {
			client1.send({
				cmd: 'authPlayer',
				data: {
					guid: player1.guid
				}
			});
		});
		client1.on('message', function(msg) {
			onMsg1(msg);
		});
	});

	asyncTest('auth client2', function() {
		client2 = new io.Socket();
		client2.connect();
		onMsg2 = function(msg) {
			equals(msg.result, 'OK');
			start();
		};
		client2.on('connect', function() {
			client2.send({
				cmd: 'authPlayer',
				data: {
					guid: player2.guid
				}
			});
		});
		client2.on('message', function(msg) {
			onMsg2(msg);
		});
	});

	asyncTest('create game', function() {
		$.getJSON('/lobby?cmd=createGame&guid=' + player1.guid, function(data) {
			equal(data.data.players[0].nick, player1.nick);
			g1 = Game.deserialize(data.data);
			var guid = player1.guid;
			player1 = g1.getPlayer(player1.nick);
			player1.guid = guid;
			equal(g1.players[0], player1);
			start();
		});
	});

	asyncTest('join game', function() {
		var count = 0;
		onMsg1 = function(msg) {
			g1.addBody(Player.deserialize(msg.data.player), true);
			equal(g1.players.length, 2);
			equal(g1.players[1].x, g1.world.width - 16);
			equal(g1.players[1].y, 0);
			if (++count == 2) {
				start();
			}
		};
		$.getJSON('/lobby?cmd=joinGame&guid=' + player2.guid, function(data) {
			g2 = Game.deserialize(data.data);
			var guid = player2.guid;
			player2 = g2.getPlayer(player2.nick);
			player2.guid = guid;
			equal(g2.players[1], player2);
			equal(data.data.players[0].nick, player1.nick);
			equal(data.data.players[1].nick, player2.nick);
			if (++count == 2)  {
				start();
			}
		});
	});

	asyncTest('start game fail (not owner)', function() {
		onMsg2 = function(msg) {
			equal(msg.code, 0);
			start();
		};
		client2.send({
			cmd: 'startGame'
		});
	});

	asyncTest('start game works', function() {
		var count = 0;
		onMsg2 = function(msg) {
			equal(msg.cmd, 'startGame');
			if (++count == 2) {
				start();
			}
		};
		onMsg1 = function(msg) {
			equal(msg.cmd, 'startGame');
			if (++count == 2) {
				start();
			}
		};
		client1.send({
			cmd: 'startGame'
		});
	});

	asyncTest('join game fail', function() {
		$.getJSON('/lobby?cmd=joinGame&guid=' + player3.guid, function(data) {
			equal(data.result, 'ERROR');
			start();
		});
	});

	asyncTest('start moving', function() {
		onMsg1 = function(msg) {
			g1.getPlayer(msg.data.player).direction = new OGE.Direction(msg.data.cos, msg.data.sin);
			equal(g1.players[1].direction.cos, 1);
			start();
		};
		onMsg2 = function(msg) {
			equal(0, 1);
		};
		client2.send({
			cmd: 'startMove',
			data: {
				cos: 1,
				sin: 0,
				x: player2.x,
				y: player2.y,
			}
		});
	});

	asyncTest('second player leave game', function() {
		onMsg1 = function(msg) {
			var player = g1.getPlayer(msg.data.player);
			g1.removeBody(g1.getPlayer(msg.data.player));
			equal(g1.players.length, 1);
			start();
		};
		client2.disconnect();
	});

	asyncTest('cleanup', function() {
		var s = '/lobby?cmd=logoutPlayer&guid=';
		$.getJSON(s + player1.guid, function() {
			$.getJSON(s + player3.guid, function() {
				start();
			});
		});
	});
});

