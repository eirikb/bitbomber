$(function() {
	var player;

	QUnit.init();

	asyncTest('create player', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=eirikb', function(data) {
			player = $.extend(new Player(), data.data);
			equal(player.nick, 'eirikb');
			equal(data.result, 'OK');
			start();
		});
	});

	asyncTest('nick is taken', function() {
		equal(player.nick, 'eirikb');
		$.getJSON('/lobby?cmd=loginPlayer&nick=eirikb', function(data) {
			equal(data.code, 2);
			equal(data.result, 'ERROR');
			start();
		});
	});

	asyncTest('guid is invalid', function() {
		$.getJSON('/lobby?cmd=loginPlayer&guid=7', function(data) {
			equal(data.code, 1);
			start();
		});
	});

	asyncTest('guid is valid', function() {
		$.getJSON('/lobby?cmd=loginPlayer&guid=' + player.guid, function(data) {
			equal(data.data.nick, 'eirikb');
			start();
		});
	});
	asyncTest('logout fail', function() {
		$.getJSON('/lobby?cmd=logoutPlayer&guid=7', function(data) {
			equal(data.code, 0);
			start();
		});
	});

	asyncTest('logout pass', function() {
		$.getJSON('/lobby?cmd=logoutPlayer&guid=' + player.guid, function(data) {
			equal(data.result, 'OK');
			start();
		});
	});
	asyncTest('player create again', function() {
		$.getJSON('/lobby?cmd=loginPlayer&nick=eirikb', function(data) {
			player = $.extend(new Player(), data.data);
			equal(player.nick, 'eirikb');
			start();
		});
	});

	asyncTest('create game', function() {
		$.getJSON('/lobby?cmd=createGame&guid=' + player.guid + '&name=omg', function(data) {
			equal(data.data.players[0].nick, player.nick);
			start();
		});
	});

	asyncTest('create game taken', function() {
		$.getJSON('/lobby?cmd=createGame&guid=' + player.guid + '&name=omg', function(data) {
			equal(data.code, 1);
			start();
		});
	});

	asyncTest('join game fail', function() {
		$.getJSON('/lobby?cmd=joinGame&guid=7&name=omg', function(data) {
			equal(data.code, 0);
			start();
		});
	});

	asyncTest('join game fail again', function() {
		$.getJSON('/lobby?cmd=joinGame&guid=' + player.guid + '&name=7', function(data) {
			equal(data.code, 1);
			start();
		});
	});

	asyncTest('join game', function() {
		$.getJSON('/lobby?cmd=joinGame&guid=' + player.guid + '&name=omg', function(data) {
			equal(data.data.players[0].nick, 'eirikb');
			start();
		});
	});

	asyncTest('logout cleanup', function() {
		$.getJSON('/lobby?cmd=logoutPlayer&guid=' + player.guid, function(data) {
			equal(data.result, 'OK');
			start();
		});
	});
});

