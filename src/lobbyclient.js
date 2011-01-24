LobbyClient = function() {
	var user;

	this.createGame = function(fn) {
		$.getJSON('/lobby?cmd=createGame&guid=' + user.guid, function(data) {
			utils.log(data);
			fn(data);
		});
	};

	this.playNow = function(fn) {
		$.getJSON('/lobby?cmd=joinGame&guid=' + user.guid, function(data) {
			utils.log(data);
		});
	};

	this.login = function(nick, fn) {
		$.getJSON('/lobby?cmd=loginPlayer&nick=' + nick, function(data) {
			utils.log(data);
			if (data.result === 'OK') {
				user = data.data;
			}
			fn(data);
		});
	};
};

