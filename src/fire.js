/**
 * Fire object
 *
 * @constructur
 * @return {Fire}
 */
Fire = function(x, y, width, height) {
    OGE.Body.apply(this, arguments);
    this.timer = 10;
    this.power = 1;
};

Fire.prototype = Object.construct_prototype(OGE.Body);
