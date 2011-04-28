var LobbyHandler = function() {
	var $loginButton = $('#loginButton'),
	$nickField = $('#nickField'),
	$playNowButton = $('#playNowButton'),
	$createGameButton = $('#createGameButton');

	function login() {
		nick = $nickField.val();
		if (nick) {
			now.login(nick, function(ok) {
				$('#loginPanel').hide();
				$('#lobbyPanel').show();
			});
		}
	}

	function playNow() {
		utils.log('Joining game...');
		now.playNow();
	}

	function createGame() {
		utils.log('Creating game...');
	}

	$loginButton.click(function() {
		login();
	});
	$nickField.keypress(function(e) {
		if (e.keyCode === 13) {
			login();
		}
	});
	$playNowButton.click(function() {
		playNow();
	});
	$createGameButton.click(function() {
		createGame();
	});

	now.ready(function() {
		now.register('', function(data) {
			});
	});
};
