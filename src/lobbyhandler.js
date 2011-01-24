LobbyHandler = function(bomberman) {
	var lobbyClient = new LobbyClient(this),
	lobbyPanel = new LobbyPanel(this),
	user;

	this.createGame = function(fn) {
		lobbyClient.createGame(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				bomberman.startGame(game, user.nick);
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
				bomberman.startGame(game, user.nick);
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
				bomberman.login(user.guid);
				fn(true);
			} else {
				fn(false);
			}
		});
	};
};

