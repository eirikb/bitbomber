var player1, player2, client1, client2, onMsg1, onMsg2;

$(function() {
	asyncTest('create first player', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=player-1', function(data) {
			player1 = $.extend(new Player(), data.data);
			equal(player1.nick, 'player-1');
			start();
		});
	});

	asyncTest('create second player', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=player-2', function(data) {
			player2 = $.extend(new Player(), data.data);
			equal(player2.nick, 'player-2');
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
		$.getJSON('/lobby?cmd=createGame&guid=' + player1.guid + '&name=gametest', function(data) {
            console.log(data)
			equal(data.data.players[0].nick, player1.nick);
			start();
		});
	});

	asyncTest('join game', function() {
		$.getJSON('/lobby?cmd=joinGame&guid=' + player2.guid + '&name=gametest', function(data) {
			equal(data.data.players[0].nick, player1.nick);
			equal(data.data.players[1].nick, player2.nick);
			start();
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

	asyncTest('start moving', function() {
		onMsg1 = function(msg) {
			console.log(msg);
		};
		onMsg2 = function(msg) {
			console.log(msg);
			start();
		};
		client2.send({
			cmd: 'startMove',
			direction: new OGE.Direction(1, 0)
		});
	});

	asyncTest('cleanup', function() {
		var s = '/lobby?cmd=logoutPlayer&guid=';
		$.getJSON(s + player1.guid, function() {
			$.getJSON(s + player2.guid, function() {
				start();
			});
		});
	});
});

