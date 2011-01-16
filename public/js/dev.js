$(function() {
	var player;

	asyncTest('create player', function() {
		$.getJSON('/lobby?cmd=login&nick=eirikb', function(data) {
			player = $.extend(new Player(), data);
			equal(player.nick, 'eirikb');
			start();
		});
	});

	asyncTest('nick is taken', function() {
		equal(player.nick, 'eirikb');
		$.getJSON('/lobby?cmd=login&nick=eirikb', function(data) {
			equal(data.code, 2);
			start();
		});
	});

	asyncTest('guid is invalid', function() {
		$.getJSON('/lobby?cmd=login&guid=7', function(data) {
			equal(data.code, 1);
			start();
		});
	});


	asyncTest('guid is valid', function() {
		$.getJSON('/lobby?cmd=login&guid=' + player.guid, function(data) {
			equal(data.nick, 'eirikb');
			start();
		});
	});

	asyncTest('logout fail', function() {
		$.getJSON('/lobby?cmd=logout&guid=7', function(data) {
			equal(data.code, 0);
			start();
		});
	});

	asyncTest('logout pass', function() {
		$.getJSON('/lobby?cmd=logout&guid=' + player.guid, function(data) {
			equal(data, 'OK');
			start();
		});
	});
});

