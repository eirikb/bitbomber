var http = require('http'),
nodeStatic = require('../lib/node-static/lib/node-static'),
c = require('commons'),
url = require('url'),
lobbyhandler = require('lobbyhandler'),
gamehandler = require('gamehandler'),
fs = require('fs'),
OGE = require('../lib/bomberman-client/dist/bomberman');
global._ = require('../lib/underscore/underscore');

function Bomberman(port) {
	global._ = _;
	var server = http.createServer(function(request, response) {
		var publicFiles = new nodeStatic.Server('lib/bomberman-client/public', {
			cache: false
		});
		var sharedFiles = new nodeStatic.Server('lib/bomberman-client/src', {
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

