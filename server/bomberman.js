var http = require('http'),
nodeStatic = require('../lib/node-static/lib/node-static'),
c = require('commons'),
url = require('url'),
lobbyhandler = require('lobbyhandler'),
gamehandler = require('gamehandler'),
OGE = require('../lib/bomberman-client/dist/bomberman');
global._ = require('../lib/underscore/underscore');

function Bomberman(port) {
	global._ = _;
	var server = http.createServer(function(request, response) {
		var publicFiles = new nodeStatic.Server('public', {
			cache: false
		});

		request.addListener('end', function() {
			var location = url.parse(request.url, true),
			params = (location.query || request.headers);
			if (location.pathname === '/lobby') {
				lobbyhandler.incoming(response, params);
			} else {
				publicFiles.serve(request, response);
			}
		});
	});

	server.listen(port);
	gamehandler.setServer(server);
	c.log('Server running on port ' + port);
};

module.exports = Bomberman;

