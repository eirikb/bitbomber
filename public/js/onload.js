var $infoArea,
utils = {},
version = 0.3;

utils.log = function() {
	if (typeof console !== 'undefined' && console !== null) {
		console.log(arguments);
	}
	var msg = '';
	for (var i = 0; i < arguments.length; i++) {
		msg += arguments[i] + ' ';
	}
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
	$infoArea.attr('scrollTop', $infoArea.attr('scrollHeight'));
};

$(function() {
	$infoArea = $('#infoArea');
	utils.log('Versions: OGE: ' + OGE.version + '. Game: ' + Game.version + '. Client: ' + version);

	var client = new io.Socket();
	gameHandler = new GameHandler(client),
	lobbyHandler = new LobbyHandler(client);
});
