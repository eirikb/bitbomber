/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */

var OGE = typeof require !== 'undefined' ? require('./oge') : OGE;

Bomb = function() {
	OGE.Body.apply(this, arguments);
	this.size = 1;
	this.timer = 4;
	this.power = 1;
};

Bomb.prototype = new OGE.Body();

Bomb.prototype.serialize = function() {
	return {
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height,
		size: this.size,
		power: this.power,
		guid: this.guid
	};
};

Bomb.deserialize = function(data) {
	var bomb = new Bomb(data.x, data.y, data.width, data.height);
	for (attr in data) {
		bomb[attr] = data[attr];
	}
	return bomb;
};

// Export OGE for CommonJS
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Bomb;
}