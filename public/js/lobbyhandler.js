var LobbyHandler = function(client) {
	var $loginButton = $('#loginButton'),
	$nickField = $('#nickField'),
	$playNowButton = $('#playNowButton'),
	$createGameButton = $('#createGameButton');

	function register(playerData) {
		if (playerData) {
			bitbomber.player = Player.deserialize(playerData);
			utils.log('player', bitbomber.player);
		}
	}

	function connect() {
		utils.log('Connecting...');
		client.connect();
		utils.log('Connected. Registering...');
		client.send({
			cmd: 'register'
		});
	}

	function login() {
		nick = $nickField.val();
		if (nick) {
			client.send({
				cmd: 'login', 
				nick: nick
			});
			$('#loginPanel').hide();
			$('#lobbyPanel').show();
		}
	}

	function playNow() {
		utils.log('Joining game...');
		client.send({
			cmd: 'playNow'
		});
	}

	function createGame() {
		utils.log('Creating game...');
		client.send({
			cmd: 'createGame'
		});
	}

	client.on('message', function(msg) {
		switch (msg.cmd) {
			case 'register':
				register(msg.player);
				break;
		}
	});

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

	connect();
};
