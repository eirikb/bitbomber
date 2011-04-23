var LobbyHandler = function(client) {
	this.client = client;
	var self = this;

	client.on('message', function(msg) {
		switch (msg.cmd) {
			case 'register':
				self.register(msg.player);
				break;
		}
	});

	$('#loginButton').click(function() {
		self.login();
	});
	$('#nickField').keypress(function(e) {
		if (e.keyCode === 13) {
			self.login();
		}
	});

	self.connect();
};

LobbyHandler.prototype.login = function() {
	var $nickField = $('#nickField');
	nick = $nickField.val();
	if (nick) {
		$('#loginPanel').hide();
		$('#lobbyPanel').show();
	}
	$nickField.select();
};

LobbyHandler.prototype.connect = function() {
	utils.log('Connecting...');
	this.client.connect();
	utils.log('Connected. Registering...');
	this.client.send({
		cmd: 'register'
	});
};

LobbyHandler.prototype.register = function(player) {
	if (player) {
		this.player = player;
		utils.log('player', player);
	} else {
		utils.log('ERROR!');
	}
};
