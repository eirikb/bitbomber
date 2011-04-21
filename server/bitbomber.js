require.paths.unshift(__dirname);

var http = require('http'),
nodeStatic = require('node-static'),
url = require('url'),
players = require('players.js'),
//games = require('games'),
//ingame = require('ingame'),
socketio = require('socket.io'),
port = 8000;


var server = http.createServer(function(req, res) {
	var publicFiles = new nodeStatic.Server('../public', {
		cache: false
	}), sharedFiles = new nodeStatic.Server('../shared', {
        cache: false
    });

    publicFiles.serve(req, res, function (e) {
        if (e) {
            sharedFiles.serve(req, res);
        }
    });

});
server.listen(port);

var socket = socketio.listen(server);



socket.on('connection', function(client) {
	client.on('message', function(msg) {
        /*
		var p = b.sessionPlayers[client.sessionId],
		g;
		if (typeof p !== 'undefined') {
			g = b.playerGames[p.nick];
		}
		var cmd = msg.cmd;
		switch (cmd) {
		case 'authPlayer':
			players.authPlayer(cmd, client, msg.data.guid);
			break;
		case 'startGame':
			games.startGame(cmd, client, p, g);
			break;
		case 'endMove':
			ingame.endMove(cmd, p, g, msg.data);
			break;
		case 'startMove':
			ingame.startMove(cmd, p, g, msg.data);
			break;
		case 'placeBomb':
			ingame.placeBomb(cmd, p, g, msg.data);
			break;
		case 'playerDead':
			ingame.playerDead(cmd, p, g, msg.data);
			break;
		case 'resurectPlayer':
			ingame.resurectPlayer(cmd, p, g, msg.data);
			break;
		default:
			c.log('IO: Unkown command ' + msg.cmd);
			break;
		}
        */
	});
	client.on('disconnect', function() {
        /*
		var player = b.sessionPlayers[client.sessionId];
		players.logoutPlayer('logoutPlayer', player);
        */
	});
});



players.init(socket);

console.log('Server running at ' + port);

/*ingame.startBombTimer();
	var server = http.createServer(function(request, response) {
		var publicFiles = new nodeStatic.Server('public', {
			cache: false
		});

		request.addListener('end', function() {
			var location = url.parse(request.url, true),
			params = (location.query || request.headers);
			if (location.pathname === '/lobby') {

				var res;
				var p = b.playerGuids[params.guid];
				switch (params.cmd) {
				case 'loginPlayer':
					res = players.loginPlayer(params.guid, params.nick, p);
					break;
				case 'logoutPlayer':
					res = players.logoutPlayer(p);
					break;
				case 'createGame':
					if (c.isSet(p)) {
						res = games.createGame(p, params.name);
					} else {
						res = c.error(0, 'UNKNOWN PLAYER');
					}
					break;
				case 'joinGame':
					if (c.isSet(p)) {
						res = games.joinGame(params.cmd, p, params.name);
					} else {
						res = c.error(0, 'UNKNOWN PLAYER'); 
					}
					break;
				default:
					res = c.error(0, 'UNKNOWN COMMAND');
				}
				c.jsonEnd(response, res);
			} else {
				publicFiles.serve(request, response);
			}
		});
	});

	server.listen(port);


	c.log('Server running on port ' + port);
*/

