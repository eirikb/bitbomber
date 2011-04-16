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

