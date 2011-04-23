KeyboardHandler = function() {
	var keyCode, keydown, keyup,
	self = this;
	self.enabled = true;

	self.keydown = function(callback) {
		keydown = callback;
		return this;
	};

	self.keyup = function(callback) {
		keyup = callback;
		return this;
	};

	self.init = function() {
		$(document).keydown(function(e) {
			var dir = null;
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
			if (dir !== null) {
				if (keyCode !== e.keyCode) {
					keyCode = dir !== 'space' ? e.keyCode : keyCode;
					self.enabled && keydown(dir);
				}
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
			return true;
		}).keyup(function(e) {
			if (e.keyCode === keyCode) {
				keyCode = 0;
				self.enabled && keyup();
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
};

