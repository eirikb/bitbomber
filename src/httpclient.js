HttpClient = function() {
	var user;

	this.createGame = function(fn) {
		$.getJSON('/lobby?cmd=createGame&guid=' + user.guid, function(data) {
			utils.log('createGame', data);
			fn(data);
		});
	};

	this.playNow = function(fn) {
		$.getJSON('/lobby?cmd=joinGame&guid=' + user.guid, function(data) {
			utils.log('playNow', data);
            fn(data);
		});
	};

	this.login = function(nick, fn) {
		$.getJSON('/lobby?cmd=loginPlayer&nick=' + nick, function(data) {
			utils.log('loginPlayer', data);
			if (data.result === 'OK') {
				user = data.data;
			}
			fn(data);
		});
	};
};

