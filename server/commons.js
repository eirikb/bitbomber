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

exports.error = function(cmd, code, msg) {
    console.log('cmd', cmd);
    console.log('code', code);
    console.log('msg', msg);
    if (arguments.length === 1) {
        msg = code;
        code = cmd;
        delete cmd;
    }
	return {
		cmd: cmd,
		result: 'ERROR',
		code: code,
		msg: msg
	};
};

exports.success = function(cmd, data, msg) {
    if (arguments.length === 1) {
        data = cmd;
        delete cmd;
    }
	return {
		cmd: cmd,
		result: 'OK',
		data: data,
		msg: msg
	};
};

