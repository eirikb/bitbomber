var sys = require('sys');

exports.isSet = function(val) {
	return typeof val !== 'undefined';
};

exports.log = function(msg) {
	sys.log(msg);
};

exports.s4 = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

exports.guid = function() {
	return this.s4() + this.s4();
};

exports.jsonEnd = function(response, obj)  {
	response.writeHead(200, {
		'Content-Type': 'application/x-javascript'
	});
	response.end(JSON.stringify(obj));
};

exports.error = function(code, msg) {
	return {
		error: msg,
		code: code
	};
};

