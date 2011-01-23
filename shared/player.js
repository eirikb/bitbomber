/**
 * Player object
 *
 * @constructur
 * @return {Player}
 */
Player = function(x, y, width, height, nick) {
	this.nick = nick;
	if (arguments.length === 1) {
		this.nick = arguments[0];
		x = 0;
	}
	OGE.Body.apply(this, arguments);
	this.speed = 1;
	this.slide = true;
	this.bombSize = 1;
	this.bombPower = 1;
	this.life = 3;
	this.armor = 0;
	this.bombs = 1;
};

Player.prototype = Object.construct_prototype(OGE.Body);

Player.prototype.serialize = function() {
	return  {
		nick: this.nick,
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height,
		speed: this.speed,
		armor: this.armor
	};
};

Player.deserialize = function(data) {
	return _.extend(new Player(data.x, data.y, data.width, data.height, data.nick), data);
};

