/**
 * Box object
 *
 * @constructur
 * @return {Box}
 */
Box = function() {
	OGE.Body.apply(this, arguments);
	this.armor = 1;
};

Box.prototype = new OGE.Body();

