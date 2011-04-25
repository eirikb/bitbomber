/**
 * Box object
 *
 * @constructur
 * @return {Box}
 */

var OGE = typeof require !== 'undefined' ? require('oge') : OGE;

Box = function() {
	OGE.Body.apply(this, arguments);
	this.armor = 1;
};

Box.prototype = new OGE.Body();

// Export OGE for CommonJS
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Box;
}

