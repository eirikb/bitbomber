var http = require('http'),
nodeStatic = require('../lib/node-static/lib/node-static'),
c = require('commons'),
url = require('url'),
lobbyhandler = require('lobbyhandler'),
gamehandler = require('gamehandler'),
_ = require('../shared/underscore-min'),
fs = require('fs');

function Bomberman(port) {
	var files = ['oge', 'base', 'player', 'box', 'bomb', 'fire', 'powerup', 'game'];
	for (var i = 0; i < files.length; i++) {
		eval(fs.readFileSync(__dirname + '/../shared/' + files[i] + '.js').toString());
	};

	var server = http.createServer(function(request, response) {
		var publicFiles = new nodeStatic.Server('./public', {
			cache: false
		});
		var sharedFiles = new nodeStatic.Server('./shared', {
			cache: false
		});

		request.addListener('end', function() {
			var location = url.parse(request.url, true),
			params = (location.query || request.headers);
			if (location.pathname === '/lobby') {
				lobbyhandler.incoming(response, params);
			} else {
				publicFiles.serve(request, response, function(e, res) {
					if (e && (e.status === 404)) {
						sharedFiles.serve(request, response);
					}
				});
			}
		});
	});

	server.listen(port);
	gamehandler.setServer(server);
	c.log('Server running on port ' + port);
};

module.exports = Bomberman;

