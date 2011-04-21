var LobbyHandler = function(socketClient) {
    this.socketClient = socketClient;
};

LobbyHandler.prototype.createGame = function(callback) {
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

	LobbyHandler.prototype.playNow = function(fn) {
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

	LobbyHandler.prototype.login = function(nick, fn) {
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

