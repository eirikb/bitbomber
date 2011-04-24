/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */
Bomb = function() {
	OGE.Body.apply(this, arguments);
	this.size = 1;
	this.timer = 4;
	this.power = 1;
};

Bomb.prototype = new OGE.Body();

