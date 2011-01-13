/**
 * Player object
 *
 * @constructur
 * @return {Player}
 */
Player = function(x, y, width, height, nick) {
    OGE.Body.apply(this, arguments);
    this.nick = nick;
    if (arguments.length === 1) {
        this.nick = arguments[0];
    }
    this.slide = true;
    this.bombSize = 1;
    this.bombPower =1;
    this.life = 3;
    this.armor = 0;
    this.bombs = 1;
};

Player.prototype = Object.construct_prototype(OGE.Body);
