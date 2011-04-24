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
	this.speed = 3;
	this.slide = true;
	this.bombSize = 1;
	this.bombPower = 1;
	this.life = 3;
	this.armor = 0;
	this.bombs = 1;
	this.power = 1;
	this.type = 0;
	this.color = 0;
};

Player.prototype = new OGE.Body();

Player.prototype.serialize = function() {
	return {
		nick: this.nick,
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height,
		speed: this.speed,
		armor: this.armor,
		type: this.type,
		color: this.color,
		publicGuid: this.publicGuid
	};
};

Player.deserialize = function(data, player) {
	if (!player) {
		player = new Player(data.x, data.y, data.width, data.height, data.nick);
	}
	for (attr in data) {
		player[attr] = data[attr];
	}
	return player;
};

