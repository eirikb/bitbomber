KeyboardHandler = function() {
	var keyCode, keydown, keyup;

	this.keydown = function(callback) {
		keydown = fn;
		return this;
	};

	this.keyup = function(callback) {
		keyup = fn;
		return this;
	};

	$(document).keydown(function(e) {
		var prevent = false,
		dir = null;
		switch (e.keyCode) {
		case 32:
			dir = 'space';
			break;
		case 37:
		case 65:
			dir = 'left';
			break;
		case 38:
		case 87:
			dir = 'up';
			break;
		case 39:
		case 68:
			dir = 'right';
			break;
		case 40:
		case 83:
			dir = 'down';
			break;
		}
		if (dir !== null && keyCode !== e.keyCode) {
			keyCode = e.keyCode;
			prevent = true;
			keydown(dir);
		}
		if (prevent) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		}

	}).keyup(function(e) {
		if (e.keyCode === keyCode) {
			keyCode = 0;
			keyup();
		}
	}).keypress(function(e) {
		switch (e.keyCode) {
		case 32:
		case 37:
		case 38:
		case 39:
		case 40:
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	});
};

