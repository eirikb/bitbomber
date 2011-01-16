var player1, player2, client1, client2;

$(function() {
	asyncTest('create first player', function() {
		$.getJSON('/lobby?cmd=login&nick=player-1', function(data) {
			player1 = $.extend(new Player(), data);
			equal(player1.nick, 'player-1');
			start();
		});
	});

	asyncTest('create second player', function() {
		$.getJSON('/lobby?cmd=login&nick=player-2', function(data) {
			player2 = $.extend(new Player(), data);
			equal(player2.nick, 'player-2');
			start();
		});
	});

	asyncTest('create game', function() {
		$.getJSON('/lobby?cmd=create&guid=' + player1.guid + '&name=gametest', function(data) {
			equal(data.players[0].nick, player1.nick);
			start();
		});
	});

	asyncTest('join game', function() {
		$.getJSON('/lobby?cmd=join&guid=' + player2.guid + '&name=gametest', function(data) {
			equal(data.players[1].nick, player2.nick);
			start();
		});
	});

	asyncTest('start game fail (not owner)', function() {
		client2 = new io.Socket();
		client2.connect();
		client2.on('connect', function() {
			client2.send({
				guid: player2.guid,
				cmd: 'start'
			});
		});
		client2.on('message', function(msg) {
			equals(msg.code, 0);
			start();
		});
	});

	asyncTest('start game success', function() {
		client1 = new io.Socket();
		client1.connect();
		client1.on('connect', function() {
			client1.send({
				guid: player1.guid,
				cmd: 'start'
			});
		});
		client1.on('message', function(msg) {
            equals(msg, 'OK');
			start();
		});
	});

	asyncTest('cleanup', function() {
		var s = '/lobby?cmd=logout&guid=';
		$.getJSON(s + player1.guid, function() {
			$.getJSON(s + player2.guid, function() {
				start();
			});
		});
	});
});

