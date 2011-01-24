/*!
 * The MIT License
 *
 * Copyright (c) 2011 Eirik Brandtzæg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Eirik Brandtzæg <eirikb@eirikb.no>
 * @Version 0.5
 */

var OGE = {};

/**
 * Direction object
 *
 * @constructur
 * @param {number} cos Cosine
 * @param {number} sin Sines
 * @return {OGE.Direction}
 */
OGE.Direction = function(cos, sin) {
	this.cos = typeof(cos) != 'undefined' ? cos: 0;
	this.sin = typeof(sin) != 'undefined' ? sin: 0;

};

/**
 * Rotate the direction based on degrees (not radians)
 * Will update cos and sin accordingly
 * To rotate 'the other way', use negative numbers
 *
 * @param {number} degrees Amount of degrees to roate cos and sin
 * @return this
 */
OGE.Direction.prototype.rotate = function(degrees) {
	var radian = degrees * (Math.PI / 180);
	this.cos = Math.cos(Math.acos(this.cos) + radian);
	this.sin = Math.sin(Math.asin(this.sin) + radian);
	return this;
};

/**
 * Clone this direction
 * 
 * @return new OGE.Direction with same cos and sin
 */
OGE.Direction.prototype.clone = function() {
	return new OGE.Direction(this.cos, this.sin);
};

/**
 * Zone object
 * Note that x and y in zone is within the grid of zones,
 * unlike in bodies where it is the actual coordinates
 * Zones store links to bodies within them
 *
 * @constructur
 * @param {number} x X-gridcoordinate in world
 * @param {number} y Y-gridcoordinate in world
 * @return {OGE.Zone}
 */
OGE.Zone = function(x, y) {
	this.x = typeof(x) != 'undefined' ? x: 0;
	this.y = typeof(y) != 'undefined' ? y: 0;

	this.bodies = [];
};

/**
 * Add a body to the zone
 *
 * @param {OGE.Body} body Body to add
 */
OGE.Zone.prototype.addBody = function(body) {
	for (var i = 0; i < this.bodies.length; i++) {
		if (this.bodies[i] === body) {
			return;
		}
	}
	this.bodies.push(body);
};

/**
 * Remove body from the zone
 *
 * @param {OGE.Body} body Body to remove
 */
OGE.Zone.prototype.removeBody = function(body) {
	for (var i = 0; i < this.bodies.length; i++) {
		if (this.bodies[i] === body) {
			this.bodies.splice(i, 1);
			break;
		}
	}
};

/**
 * Body object
 *
 * @constructur
 * @param {number} x X-coordinate on world
 * @param {number} y Y-coordinate on world
 * @param {number} width Width of body
 * @param {number} height Height of body
 * @return {OGE.Body}
 */
OGE.Body = function(x, y, width, height) {
	this.x = typeof(x) != 'undefined' ? x: 0;
	this.y = typeof(y) != 'undefined' ? y: 0;
	this.width = typeof(width) != 'undefined' ? width: 1;
	this.height = typeof(height) != 'undefined' ? height: 1;

	this.speed = 0;
	this.direction = null;
	this.slide = false;
	this.active = false;

	this.onCollisions = [];
};

/**
 * Remove all onCollision events
 */
OGE.Body.prototype.clearEvents = function() {
	this.onCollisions = [];
};

/**
 * Add event for onCollision
 * Will trigger when body colide with another body
 *
 * @param {Function} onCollisionEvent event
 */
OGE.Body.prototype.onCollision = function(onCollisionEvent) {
	this.onCollisions.push(onCollisionEvent);
};

/**
 * Collide two bodies (this and given body)
 * Will trigger all onCollision events
 * 
 * @param {OGE.Body} body Body this body has collided with
 * @return false if one of onCollision events return false, true if not
 */
OGE.Body.prototype.collide = function(body) {
	var collide = true;
	for (var i = 0; i < this.onCollisions.length; i++) {
		if (this.onCollisions[i](body) === false) {
			collide = false;
		}
	}
	return collide;
};

/**
 * Collide two bodies (this and given body)
 * Will trigger all onCollision events
 * 
 * @param {OGE.Body} body Body this body has collided with
 * @return false if one of onCollision events return false, true if not
 */
OGE.Body.prototype.collide = function(body) {
	var collide = true;
	for (var i = 0; i < this.onCollisions.length; i++) {
		if (this.onCollisions[i](body) === false) {
			collide = false;
		}
	}
	return collide;
};

/**
 * Check if this body intersects with a given body/location
 *
 * @param {OGE.Body} bodyOrX Body to chech intersection with,
 *                   this can also be {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return true if the bodies intersect, false if not
 */
OGE.Body.prototype.intersects = function(bodyOrX, y, width, height) {
	var x, body;
	x = body = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}

	return this.x < x + width && this.x + this.width > x && this.y < y + height && this.y + this.height > y;
};

/**
 * Check how much this body intersects with nother body
 * Will not check if they actually intersect,
 * so can return negative number @see #intersects 
 *
 * @param {OGE.Body} bodyOrX Body to chech intersection with,
 *                   this can also be {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return How much the two bodies intersect, can be negative
 */
OGE.Body.prototype.intersection = function(bodyOrX, y, width, height) {
	var x, body;
	x = body = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}

	var sx, ex, sy, ey;
	sx = this.x > x ? this.x: x;
	ex = this.x + this.width < x + width ? this.x + this.width: x + width;
	sy = this.y > y ? this.y: y;
	ey = this.y + this.height < y + height ? this.y + this.width: y + height;
	return (ex - sx) * (ey - sy);
};

/**
 * World object, contain everything
 *
 * @constructur
 * @param {number} width Width of map
 * @param {number} height Height of map
 * @param {number} zoneSize How large each zone should be (default 10)
 * @return {OGE.World}
 */
OGE.World = function(width, height, zoneSize) {
	this.width = typeof(width) != 'undefined' ? width: 640;
	this.height = typeof(height) != 'undefined' ? height: 480;
	this.zoneSize = typeof(zoneSize) != 'undefined' ? zoneSize: 10;
	this.activeBodies = [];

	var xZones = width / this.zoneSize + 1 << 0;
	var yZones = height / this.zoneSize + 1 << 0;
	this.zones = [];

	for (var x = 0; x < xZones; x++) {
		this.zones[x] = [];
		for (var y = 0; y < yZones; y++) {
			this.zones[x][y] = new OGE.Zone(x, y);
		}
	}

	// Private functions
};

/**
 * Add a body to the world, will be added to zones
 * Bodies can be added over other bodies (x, y)
 *
 * @param {OGE.Body} body Body to add
 * @param {boolean} active Set if the body is active or not (movable)
 * @return true if body was added, false if not (out of bounds)
 */
OGE.World.prototype.addBody = function(body, active) {
	if (this.addBodyToZones(body) !== true) {
		return false;
	}

	if (arguments.length >= 2) {
		body.active = active;
	}

	if (body.active) {
		this.activeBodies.push(body);
	}

	return true;
};

/**
 * Removes a body from the world (and zones it is)
 * Important: Removes all listeners to onActivate/onDeactivate
 *
 * @param {OGE.Body} body Body to remove
 */
OGE.World.prototype.removeBody = function(body) {
	this.removeBodyFromZones(body);
	for (var i = 0; i < this.activeBodies.length; i++) {
		if (this.activeBodies[i] === body) {
			this.activeBodies.splice(i, 1);
			break;
		}
	}

};

/**
 * Get all bodies from a given location (either OGE.Body or x,y)
 * Given location can be outside the bounds of the World
 *
 * @param {OGE.Body} bodyOrX Uses this to find other bodies (x, y, width, height)
 *                           This can also be the {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return Array of OGE.Body found, including the given body
 */
OGE.World.prototype.getBodies = function(bodyOrX, y, width, height) {
	var body, x;
	body = x = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}
	x = x < 0 ? 0: x;
	x = x + width > this.width ? this.width - width: x;
	y = y < 0 ? 0: y;
	y = y + height > this.height ? this.height - height: y;

	var bodies = [];
	var zones = this.getZones(x, y, width, height);
	for (var i = 0; i < zones.length; i++) {
		var bodies2 = zones[i].bodies;
		for (var j = 0; j < bodies2.length; j++) {
			var b = bodies2[j];
			var contains = false;
			for (var k = 0; k < bodies.length; k++) {
				if (bodies[k] === b) {
					contains = true;
					break;
				}
			}
			if (!contains) {
				bodies.push(b);
			}
		}
	}

	return bodies;
};

/**
 * Get all zones from a given location (either OGE.Body or x,y)
 * Given location can not be outside the bounds of the World
 *
 * @param {OGE.Body} bodyOrX Uses this to find other bodies (x, y, width, height)
 *                           This can also be the {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return Array of OGE.Zone found, including the given body
 */
OGE.World.prototype.getZones = function(bodyOrX, y, width, height) {
	var body, x;
	body = x = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}

	if (x >= 0 && x + width - 1 < this.width && y >= 0 && y + height - 1 < this.height) {
		var x1 = x / this.zoneSize << 0;
		var x2 = (x + width) / this.zoneSize << 0;
		var y1 = y / this.zoneSize << 0;
		var y2 = (y + height) / this.zoneSize << 0;

		var pos = 0;
		var z = [];
		for (x = x1; x <= x2; x++) {
			for (y = y1; y <= y2; y++) {
				z[pos++] = this.zones[x][y];
			}
		}
		return z;
	} else {
		return [];
	}
};

/**
 * Does one 'step' in the world, as in time passes
 * Will move all active bodies
 *
 * @param {number} steps Amount of steps to do
 */
OGE.World.prototype.step = function(steps) {
	steps = arguments.length === 0 ? 1: steps;
	for (var step = 0; step < steps; step++) {
		for (var i = 0; i < this.activeBodies.length; i++) {
			var body = this.activeBodies[i];
			if (body.speed > 0 && body.direction !== null) {
				this.moveBody(body);
			}
		}
	}
};

// Originally private methods

OGE.World.prototype.addBodyToZones = function(body) {
	var zones = this.getZones(body);
	if (zones.length === 0) {
		return false;
	}
	for (var i = 0; i < zones.length; i++) {
		zones[i].addBody(body);
	}
	return true;
};

OGE.World.prototype.removeBodyFromZones = function(body) {
	var zones = this.getZones(body);
	for (var i = 0; i < zones.length; i++) {
		zones[i].removeBody(body);
	}
};

OGE.World.prototype.moveBody = function(body, direction, steps) {
	var lastX, lastY, bodies;
	if (arguments.length === 1) {
		direction = body.direction;
		steps = body.speed;
	}

	for (var i = 0; i < steps; i++) {
		lastX = body.x;
		lastY = body.y;
		this.removeBodyFromZones(body);
		body.x += direction.cos;
		body.y += direction.sin;

		bodies = this.getBodies(body);
		for (var j = 0; j < bodies.length; j++) {
			var body2 = bodies[j];
			if (body !== body2 && ! body2.intersects(lastX, lastY, body.width, body.height) && body2.intersects(body)) {
				var collide1 = body.collide(body2) === true;
				var collide2 = body2.collide(body) === true;
				if (collide1 && collide2) {
					body.x = lastX;
					body.y = lastY;
					this.addBodyToZones(body);
					if (body.slide && j >= 0) {
						this.slideBody(body, direction);
					} else {
						return;
					}
				}
			}
		}
		this.addBodyToZones(body);
	}
};

OGE.World.prototype.slideBody = function(body, direction) {
	var self = this;
	var getIntersection = function(direction) {
		var intersection = 0;
		var x = body.x + direction.cos * 1.9 << 0;
		if (x !== body.x) {
			x = body.x + (x > body.x ? 1: - 1);
		}
		var y = body.y + direction.sin * 1.9 << 0;
		if (y !== body.y) {
			y = body.y + (y > body.y ? 1: - 1);
		}
		var bodies = self.getBodies(x, y, body.width, body.height);
		for (var i = 0; i < bodies.length; i++) {
			var body2 = bodies[i];
			if (body2 !== body && body2.intersects(x, y, body.width, body.height)) {
				intersection += body2.intersection(x, y, body.width, body.height);
			}
		}
		return intersection << 0;
	};

	var intersection1 = getIntersection(direction.clone().rotate( - 45));
	var intersection2 = getIntersection(direction.clone().rotate(45));
	if (intersection1 < intersection2) {
		this.moveBody(body, direction.clone().rotate( - 90), 1);
	} else if (intersection1 > intersection2) {
		this.moveBody(body, direction.clone().rotate(90), 1);
	}
};

/*!
 * The MIT License
 *
 * Copyright (c) 2011 Eirik Brandtzæg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Eirik Brandtzæg <eirikb@eirikb.no>
 * @Version 0.1
 */

// Prevent protoype inheritance from calling constructors twice when using apply
// Thanks to eboyjr (##javascript @ freenode)
Object.construct_prototype = function(o) {
	var f = function() {};
	f.prototype = o.prototype;
	return new f();
};

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
};

Player.prototype = Object.construct_prototype(OGE.Body);

Player.prototype.serialize = function() {
	return {
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

/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */
Bomb = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.size = 1;
	this.timer = 10;
	this.power = 1;
};

Bomb.prototype = Object.construct_prototype(OGE.Body);

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

/**
 * Game object
 *
 * @constructur
 * @return {Game}
 */
Game = function(width, height) {
	this.world = new OGE.World(width, height, 16);
	this.players = [];
	this.bombs = [];
	this.fires = [];
	this.blocks = [];
	this.bricks = [];

	this.maxPlayers = 4;
};

Game.prototype.addBody = function(body, active) {
	if (!this.world.addBody(body, active)) {
		return false;
	}
	if (body instanceof Player) {
		if (this.players.length == this.maxPlayers) {
			return false;
		} else if (this.players.length === 0) {
			this.owner = body;
		}
		this.players.push(body);
	} else if (body instanceof Bomb) {
		this.bombs.push(body);
	}
	return true;
};

Game.prototype.serialize = function() {
	var self = this;
	var data = {
		width: this.world.width,
		height: this.world.height
	};
	var serializeboxes = function(name, attrs) {
		if (self[name].length > 0) {
			var size = self[name][0].width;
			data[name] = {};
			data[name].size = size;
			data[name].pos = [];
			data[name].attrs = {};
			_.each(self[name], function(box) {
				var pos = box.y / size * Math.floor(self.world.width / size) + box.x / size;
				data[name].pos.push(pos);
				_.each(attrs, function(attr) {
					data[name].attrs[attr] = box[attr];
				});
			});
		}
	};
	if (this.players.length > 0) {
		data.players = [];
		_.each(this.players, function(player) {
			data.players.push(player.serialize());
		});
	}

	serializeboxes('blocks', ['armor']);
	serializeboxes('bricks');
	return data;
};

Game.prototype.removeBody = function(body) {
	this.world.removeBody(body);
	this.players = _.without(this.players, body);
	this.bombs = _.without(this.bombs, body);
	this.blocks = _.without(this.blocks, body);
	this.bricks = _.without(this.bricks, body);
};

Game.prototype.getPlayer = function(nick) {
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].nick === nick) {
			return this.players[i];
		}
	}
};

Game.prototype.createBlocks = function(size) {
	for (var y = 1; y < this.world.height / size - 2; y += 2) {
		for (var x = 1; x < this.world.width / size - 2; x += 2) {
			var b = new Box(x * size, y * size, size, size);
			b.armor = 1;
			this.blocks.push(b);
			this.addBody(b);
		}
	}
	return this;
};

Game.prototype.createBricks = function(size, percentage) {
	var w = this.world.width / size;
	var h = this.world.height / size;
	for (var y = 0; y < h - 1; y++) {
		for (var x = 0; x < w - 1; x++) {
			if (Math.random() * 100 < percentage && ! (x % 2 === 1 && y % 2 === 1)) {
				if ((x > 1 || y > 1) && (x > 1 || y < h - 2) && (x < w - 2 || y > 1) && (x < w - 2 || y < h - 2)) {
					var c = new Box(x * size, y * size, size, size);
					this.bricks.push(c);
					this.addBody(c);
				}
			}
		}
	}
	return this;
};

Game.deserialize = function(data) {
	var game = new Game(data.width, data.height);
	var deserializeBoxes = function(name) {
		if (data[name].pos.length > 0) {
			var size = data[name].size;
			var boxPrY = Math.floor(data.width / size);
			_.each(data[name].pos, function(pos) {
				var x = pos % boxPrY * size;
				var y = Math.floor(pos / boxPrY) * size;
				var box = new Box(x, y, size, size);
				_.each(data[name].attrs, function(i, attr) {
					box[attr] = data[name].attrs[attr];
				});
				game[name].push(box);
				game.addBody(box);
			});
		}
	};
	deserializeBoxes('blocks');
	deserializeBoxes('bricks');
	if (data.players && data.players.length > 0) {
		_.each(data.players, function(p) {
			game.addBody(Player.deserialize(p), true);
		});
	}
	return game;
};

var $infoArea;

var client;

var utils = {};
utils.log = function(msg) {
	if (msg.cmd && msg.result) {
		if (typeof console !== 'undefined' && console !== null) {
			console.log(msg.cmd, msg);
		}
		msg = msg.cmd + ' - ' + msg.result;
	} else {
		if (typeof console !== 'undefined' && console !== null) {
			console.log(msg);
		}
	}
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
	$infoArea.attr('scrollTop', $infoArea.attr('scrollHeight'));
};

$(function() {
	$infoArea = $('#infoArea');
	LobbyClient();
});

LobbyClient = function() {
	var lobbyClient = new LobbyClient(this),
	gameClient = new GameClient(),
	gameHandler = new GameHandler(gameClient),
	game,
	user,
	player;

	gameClient.addListener('authPlayer', function(result, data) {
		console.log("auth: " + result, data);
	});

	this.createGame = function(fn) {
		lobbyClient.createGame(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				fn(true);
			} else {
				fn(fale);
			}
		});
	};

	this.playNow = function(fn) {
		lobbyClient.playNow(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				fn(true);
			} else {
				fn(false);
			}
		});

	};

	this.login = function(nick) {
		lobbyClient.login(nick, function(data) {
			if (data.result === 'OK') {
				user = data.data;
				gameClient.send('authPlayer', user.guid);
				fn(triue);
			} else {
				fn(false);
			}
		});
	};
};

LobbyClient = function() {
	var user;

	this.createGame = function(fn) {
		$.getJSON('/lobby?cmd=createGame&guid=' + user.guid, function(data) {
			utils.log(data);
			fn(data);
		});
	};

	this.playNow = function(fn) {
		$.getJSON('/lobby?cmd=joinGame&guid=' + user.guid, function(data) {
			utils.log(data);
		});
	};

	this.login = function(nick, fn) {
		$.getJSON('/lobby?cmd=loginPlayer&nick=' + $nickField.val(), function(data) {
			utils.log(data);
			if (data.result === 'OK') {
				user = data.data;
			}
			fn(data);
		});
	};

	init();
};

LobbyPanel = function(lobbyHandler) {
	var $loginPanel = $('#loginPanel'),
	$loginButton = $('#loginButton'),
	$lobbyPanel = $('#lobbyPanel'),
	$nickField = $('#nickField'),
	$playNowButton = $('#playNowButton'),
	$createGameButton = $('#createGameButton');

	var init = function() {
		$nickField.keypress(function(e) {
			if (e.keyCode === 13) {
				login();
			}
		});
		$loginButton.click(function() {
			login();
		});

		$playNowButton.click(function() {
			playNow();
		});

		$createGameButton.click(function() {
			createGame();
		});

		$nickField.focus();
	};

	var showLobby = function() {
		$loginPanel.hide();
		$lobbyPanel.show();
	};

	var createGame = function() {
		lobbyHandler.createGame(function(result) {
			if (result) {
				$lobbyPanel.hide();
			}
		});
	};

	var playNow = function() {
		lobbyHandler.playNow(function(result) {
			$lobbyPanel.hide();
		});
	};

	var login = function() {
		if ($nickField.val().length > 0) {
			lobbyHandler.login($nickField.val(), function(result) {
				if (result) {
					showLobby();
				} else {
					$loginPanel.children('span').text('Nick taken!');
				}
			});
		}
	};

	init();
};

GameHandler = function(gameClient) {

	gameClient.addListener('joinGame', function(data) {
		p = Player.deserialize(msg.data.player);
		game.addBody(p, true);
		addPlayer(p);
	});

	gameClient.addListener('startMove', function(data) {
		p = game.getPlayer(msg.data.player);
		p.direction = new OGE.Direction(msg.data.cos, msg.data.sin);
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	gameClient.addListener('endMove', function(data) {
		p = game.getPlayer(msg.data.player);
		p.direction = null;
		p.x = msg.data.x;
		p.y = msg.data.y;
	});

	gameClient.addListener('logoutPlayer', function(data) {
		p = game.getPlayer(msg.data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	gameClient.addListener('placeBomb', function(data) {
		var bomb = new Bomb(msg.data.x, msg.data.y, 16, 16);
		placeBomb(bomb);
	});

};

GameClient = function() {
	var client = new io.Socket(),
	listeners = {};

	this.addListener = function(trigger, fn) {
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	this.send = function(cmd, data) {
		client.send({
			cmd: cmd,
			data: data
		});
	};

	client.connect();
	client.on('message', function(msg) {
		_.each(listeners[msg.cmd], function(fn) {
			fn(msg.result, msg.data);
		});
	});
};

GamePanel = function(gameClient) {
	var $gamePanel = $('#gamePanel'),
	$fpsLabel = $('#fpsLabel'),
	keyboardHandler = new KeyboardHandler(),
	factorialTimer = new FactorialTimer();

	this.init = function(gameHandler) {
		$gamePanel.find('*').remove();
	};

	var addBody = function(body, image) {
		var $img = $('<img>').attr('src', 'images/' + image + '.png').css('left', body.x).css('top', body.y).addClass('body');
		$gamePanel.append($img);
		body.$img = $img;
	};

	var addPlayer = function(player) {
		addBody(player, 'pl1');
		player.animate = 0;
		player.sprite = 0;
		player.sprites = [1, 2, 1, 3];
	};

	var placeBomb = function(bomb) {
		bomb.animate = 0;
		bomb.sprite = 0;
		bomb.sprites = [1, 2, 3];
		game.addBody(bomb);
		addBody(bomb, 'bomb1');
	};

	var animatePlayer = function(p) {
		p.$img.css('left', p.x).css('top', p.y - 4);
		if (p.direction !== null && p.speed > 0) {
			if (p.lastDirection !== p.direction) {
				p.animate = 0;
				p.lastDirection = p.direction;
			}
			if (--p.animate < 0) {
				p.animate = 5;
				if (++p.sprite >= p.sprites.length) {
					p.sprite = 0;
				}
				var d;
				if (p.direction.cos !== 0) {
					d = p.direction.cos > 0 ? 'r': 'l';
				} else if (p.direction.sin !== 0) {
					d = p.direction.sin > 0 ? 'd': 'u';
				}
				p.$img.attr('src', '/images/p' + d + p.sprites[p.sprite] + '.png');
			}

		}
	};

	var animateBomb = function(b) {
		if (--b.animate < 0) {
			b.animate = 5;
			if (++b.sprite >= b.sprites.length) {
				b.sprite = 0;
			}
			b.$img.attr('src', '/images/bomb' + b.sprites[b.sprite] + '.png');
		}
	};

	var init = function() {
		$gamePanel.show();

		$gamePanel.width(game.world.width).height(game.world.height);

		$.each(game.blocks, function(i, block) {
			addBody(block, 'block');
		});

		$.each(game.bricks, function(i, brick) {
			addBody(brick, 'brick');
		});

		$.each(game.players, function(i, p) {
			addPlayer(p);
		});

		keyboardHandler.keydown(function(dir) {
			switch (dir) {
			case 'space':
				var bomb = gameHandler.placeBomb();
				placeBomb(bomb);
				break;
			case 'left':
				cos = - 1;
				break;
			case 'up':
				sin = - 1;
				break;
			case 'right':
				cos = 1;
				break;
			case 'down':
				sin = 1;
				break;
			}
			if (cos !== 0 || sin !== 0) {
				gameHandler.startMove(cos, sin);
			}
		}).keyup(function(e) {
			gameHandler.endMove();
		});

		factorialTimer.start(function(time) {
			gameHandler.step();
			if (++frame === 20) {
				$fpsLabel.text('Time: ' + time);
				frame = 0;
			}
			$.each(game.players, function(i, p) {
				animatePlayer(p);
			});
			$.each(game.bombs, function(i, b) {
				animateBomb(b);
			});
		});
	};
};

KeyboardHandler = function() {
	var keyCode, keydown, keyup;

	this.keydown = function(callback) {
		keydown = fn;
		return this;
	};

	this.keyup = function(callback) {
		keyup = fn;
		return this;
	};

	$(document).keydown(function(e) {
		var prevent = false,
		dir = null;
		switch (e.keyCode) {
		case 32:
			dir = 'space';
			break;
		case 37:
		case 65:
			dir = 'left';
			break;
		case 38:
		case 87:
			dir = 'up';
			break;
		case 39:
		case 68:
			dir = 'right';
			break;
		case 40:
		case 83:
			dir = 'down';
			break;
		}
		if (dir !== null && keyCode !== e.keyCode) {
			keyCode = e.keyCode;
			prevent = true;
			keydown(dir);
		}
		if (prevent) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		}

	}).keyup(function(e) {
		if (e.keyCode === keyCode) {
			keyCode = 0;
			keyup();
		}
	}).keypress(function(e) {
		switch (e.keyCode) {
		case 32:
		case 37:
		case 38:
		case 39:
		case 40:
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	});
};

FactorialTimer = function() {
	var time = new Date().getTime(),
	lastTime = 0,
	sleepTime = 50,
	frame = 0,
	callback;

	this.start = function(callbackFn) {
		callback = callbackFn;
		step();
	};

	var step = function() {
		time = Math.floor((new Date().getTime() - time) * 0.9 + lastTime * 0.1);
		lastTime = time;
		if (time > 50 && sleepTime > 45) {
			sleepTime--;
		} else if (time < 50 && sleepTime < 55) {
			sleepTime++;
		}
		callback(time);

		time = new Date().getTime();

		setTimeout(step, sleepTime);
	};
};

