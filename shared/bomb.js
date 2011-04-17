/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */
Bomb = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.size = 1;
	this.timer = 4;
	this.power = 1;
};

Bomb.prototype = Object.construct_prototype(OGE.Body);

