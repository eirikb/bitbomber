/**
 * Powerup object
 *
 * @constructur
 * @return {Powerup}
 */
Powerup = function() {
	OGE.Body.apply(this, arguments);
};

Powerup.prototype = Object.construct_prototype(OGE.Body);

