var http = require('http'),
sys = require('sys'),
nodeStatic = require('../lib/node-static/lib/node-static'),
faye = require('../lib/faye-node'),
url = require('url');

function Bomberman(port) {

	/*
	var createFayeServer = function() {
		return new faye.NodeAdapter({
			mount: '/faye',
			timeout: 20
		});
	};
    */

	//var faye = createFayeServer();
	//faye.attach(httpServer);
	//this.faye.attach(this.httpServer);
	//
	/*var f = (function() {
		return new faye.NodeAdapter({
			mount: '/faye',
			timeout: 20
		})
	})();
    */

	var createHttpServer = function(port) {
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
				publicFiles.serve(request, response, function(e, res) {
					if (e && (e.status === 404)) { // If the file wasn't found
						sharedFiles.serve(request, response);
					}
				});
			});
		});
		return server;
	};

	var httpServer = createHttpServer(port);

	httpServer.listen(port);

	sys.log('Server running on port ' + port);
};

module.exports = Bomberman;

