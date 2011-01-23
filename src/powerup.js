/**
 * Powerup object
 *
 * @constructur
 * @return {Powerup}
 */
Powerup = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
};

Powerup.prototype = Object.construct_prototype(OGE.Body);

