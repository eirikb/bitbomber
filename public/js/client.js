var $loginPanel, $lobbyPanel, $gamePanel, $nickField, $gameField, $gameList;
var game, player, client;

var startClient = function() {
	client = new io.Socket();
	client.connect();
	client.on('connect', function() {
		if (localStorage.guid) {
			client.send({
				cmd: 'auth',
				guid: localStorage.guid
			});
		}
	});
	client.on('message', function(msg) {
		if (msg.result !== 'error') {
			switch (msg.cmd) {
			case 'auth':
				player = msg.player;
				player.guid = localStorage.guid;
				showLobby();
				break;
			}
		} else  {
			console.log('Error: ' + msg.cmd + ' - ' + msg.code + ' - ' + msg.msg);
		}

	});
};

var showLobby = function() {
	$loginPanel.hide();
	$lobbyPanel.show();
	$gameField.focus();
	getGames();
}

var getGames = function() {
	$.getJSON('/lobby?cmd=getgames&guid=' + player.guid, function(data) {
		console.log(data);
	});
};

var createGame = function() {
	$.getJSON('/lobby?cmd=create&guid=' + player.guid, function(data) {
		if (typeof data.error === 'undefined') {
			var game = _.extend(new Game(), data);
			console.log(game);
		} 
	});
};

var login = function() {
	$.getJSON('/lobby?cmd=login&nick=' + $nickField.val(), function(data) {
		if (typeof data.error === 'undefined') {
			player = _.extend(new Player(), data);
			localStorage.guid = player.guid;
			showLobby();
		} else {
			$loginPanel.children('span').text('Nick taken!');
		}
		return false;

	});
};

$(function() {
	$loginPanel = $('#loginPanel');
	$lobbyPanel = $('#lobbyPanel');
	$gamePanel = $('#gamePanel');
	$gameList = $('#gameList');
	$nickField = $('#nickField');
	$gameField = $('#gameField');

	startClient();

	$nickField.keypress(function(e) {
		if (e.keyCode === 13) {
			login();
		}
	});

	$gameField.keypress(function(e) {
		if (e.keyCode === 13) {
			createGame();
		}
	});

	$nickField.focus();
});

