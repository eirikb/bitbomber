var $infoArea;
var utils = {};
utils.log = function(cmd, msg) {
	if (arguments.length === 1) {
		msg = cmd;
		cmd = msg.cmd;
	}
	if (typeof console !== 'undefined' && console !== null) {
		console.log(cmd, msg);
	}
	msg = cmd + ' - ' + msg.result;
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
	$infoArea.attr('scrollTop', $infoArea.attr('scrollHeight'));
};

$(function() {
	var version = 0.1;

	$infoArea = $('#infoArea');
    var lobbyHandler,
	httpClient = new HttpClient(),
	socketClient = new SocketClient(),
	gameHandler = new GameHandler(lobbyHandler, socketClient),
	gamePanel = new GamePanel(gameHandler),
	lobbyPanel = new LobbyPanel(lobbyHandler);
	lobbyHandler = new LobbyHandler(gameHandler, httpClient, socketClient);
	utils.log({cmd: 'versions', result: 'OGE: ' + OGE.version + '. Game: ' + Game.version + '. Client: ' + version});
});

