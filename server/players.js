var players = {},
Player = require('player');

exports.getPlayer = function(n) {
	return n.user ? players[n.user.clientId] : players[n];
}

exports.register = function(privateGuid, callback) {
	var player = players[privateGuid];
	if (!player) {
		player = new Player(0, 0, 16, 16);
		privateGuid = guid(4);
		player.privateGuid = privateGuid;
		players[privateGuid] = player;
	}
	players[this.user.clientId] = player;
	player.publicGuid = guid(4);
	var playerData = player.serialize();
	playerData.privateGuid = player.privateGuid;
	player.clientId = this.user.clientId;
	callback(playerData);
};

exports.logout = function(clientId) {
	delete players[clientId];
};