var DummyClient = function() {
	var listeners = {};

	this.addListener = function(trigger, fn) {
		log(trigger);
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	var callback = function(trigger, data) {
		_.each(listeners[trigger], function(callback) {
			callback('OK', data);
		});
	};

	this.send = function(cmd, data) {
		log(arguments);

		switch (cmd) {
		case 'placeBomb':
			var explode = function() {
                data.player = "test-1";
				callback('explodeBomb', data);
			};
			setTimeout(explode, 3000);
			break;
		}
	};
};

var log = function(msg) {
	if (typeof console !== 'undefined' && console !== null) {
		console.log(msg);
	}
};

$(function() {
	var dummyClient = new DummyClient(),
	lobbyHandler = {},
	gameHandler = new GameHandler(lobbyHandler, dummyClient),
	gamePanel = new GamePanel(gameHandler);

	var game = new Game(640, 480).createBlocks(16).createBricks(16, 20);
	game.addBody(new Player(0, 0, 16, 16, "test-1"), true);
	gameHandler.startGame(game, "test-1");
});

