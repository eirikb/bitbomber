GameClient = function() {
	var client = new io.Socket(),
	listeners = {};

	this.addListener = function(trigger, fn) {
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	this.send = function(cmd, data) {
		client.send({
			cmd: cmd,
			data: data
		});
	};

	client.connect();
	client.on('message', function(msg) {
		_.each(listeners[msg.cmd], function(fn) {
			fn(msg.result, msg.data);
		});
	});
};

