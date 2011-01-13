/**
 * Player object
 *
 * @constructur
 * @return {Player}
 */
Player = function(x, y, width, height, name) {
    OGE.Body.apply(this, arguments);
    this.name = arguments.length === 5 ? name : arguments[0];
};

Player.prototype = Object.construct_prototype(OGE.Body);
