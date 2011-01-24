/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */
Bomb = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.size = 1;
	this.timer = 10;
	this.power = 1;
};

Bomb.prototype = Object.construct_prototype(OGE.Body);

Bomb.prototype.serialize = function() {
	return {
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height,
		size: this.width,
	};
};

Bomb.deserialize = function(data) {
	return _.extend(new Bomb(data.x, data.y, data.width, data.height), data);
};

