var player1, player2, player3, client1, client2, onMsg1, onMsg2, g1, g2;

$(function() {
    var lobbyHandler,
	httpClient = new HttpClient(),
	socketClient = new SocketClient(),
	gameHandler = new GameHandler(lobbyHandler, socketClient),
	//gamePanel = new GamePanel(gameHandler),
	//lobbyPanel = new LobbyPanel(lobbyHandler);
	lobbyHandler = new LobbyHandler(gameHandler, httpClient, socketClient);

    /*
	asyncTest('start game fail (not owner)', function() {
		onMsg2 = function(msg) {
			equal(msg.code, 0);
			start();
		};
		client2.send({
			cmd: 'startGame'
		});
	});
    */

});

