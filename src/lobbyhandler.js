LobbyHandler = function() {
	var lobbyClient = new LobbyClient(this),
	lobbyPanel = new LobbyPanel(this),
	gameClient = new GameClient(),
	gameHandler = new GameHandler(gameClient),
	game,
	user,
	player;

	gameClient.addListener('authPlayer', function(result, data) {
		console.log("auth: " + result, data);
	});

	this.createGame = function(fn) {
		lobbyClient.createGame(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				fn(true);
			} else {
				fn(fale);
			}
		});
	};

	this.playNow = function(fn) {
		lobbyClient.playNow(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				fn(true);
			} else {
				fn(false);
			}
		});

	};

	this.login = function(nick, fn) {
		lobbyClient.login(nick, function(data) {
			if (data.result === 'OK') {
				user = data.data;
				gameClient.send('authPlayer', {
					guid: user.guid
				});
				fn(true);
			} else {
				fn(false);
			}
		});
	};
};

