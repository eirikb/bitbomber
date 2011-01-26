LobbyHandler = function(gameHandler, httpClient, socketClient) {
	var httpClient = new HttpClient(this),
	user;

	this.createGame = function(fn) {
		httpClient.createGame(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				gameHandler.startGame(game, user.nick);
				fn(true);
			} else {
				fn(fale);
			}
		});
	};

	this.playNow = function(fn) {
		httpClient.playNow(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				gameHandler.startGame(game, user.nick);
				fn(true);
			} else {
				fn(false);
			}
		});

	};

	this.login = function(nick, fn) {
		httpClient.login(nick, function(data) {
			if (data.result === 'OK') {
				user = data.data;
				socketClient.send('authPlayer', {
					guid: user.guid
				});
				fn(true);
			} else {
				fn(false);
			}
		});
	};
};

