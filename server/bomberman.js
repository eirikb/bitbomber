var http = require('http'),
sys = require('sys'),
nodeStatic = require('../lib/node-static/lib/node-static'),
faye = require('../lib/faye-node'),
url = require('url'),
lobby = require('lobby'),
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
				lobby.lobby(response, params);
			} else {
				publicFiles.serve(request, response, function(e, res) {
					if (e && (e.status === 404)) {
						sharedFiles.serve(request, response);
					}
				});
			}
		});
	});

	var bayeux = new faye.NodeAdapter({
		mount: '/faye',
		timeout: 45
	});
	bayeux.attach(server);
	server.listen(port);

	sys.log('Server running on port ' + port);
};

module.exports = Bomberman;

