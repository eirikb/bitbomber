LobbyClient = function() {
	var lobbyClient = new LobbyClient(this),
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

	this.login = function(nick) {
		lobbyClient.login(nick, function(data) {
			if (data.result === 'OK') {
				user = data.data;
				gameClient.send('authPlayer', user.guid);
				fn(triue);
			} else {
				fn(false);
			}
		});
	};
};

