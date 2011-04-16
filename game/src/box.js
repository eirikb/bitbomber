/**
 * Box object
 *
 * @constructur
 * @return {Box}
 */
Box = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.armor = 1;
};

Box.prototype = Object.construct_prototype(OGE.Body);

