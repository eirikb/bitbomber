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
 * @Version 0.6
 */

var OGE = {
	version: 0.6
};

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
		if (body.x >= 0 && body.y >= 0 && body.x + body.width < this.width && body.y + body.height < this.height) {
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
		} else {
			body.x = lastX;
			body.y = lastY;
			break;
		}
	}
};

OGE.World.prototype.slideBody = function(body, direction) {
	var self = this;
	var getIntersection = function(direction) {
		var ignoreBodies = [],
		bodies = self.getBodies(body),
		intersection,
		i,
		j,
		x,
		y,
		body2,
		ignore;
		for (i = 0; i < bodies.length; i++) {
			body2 = bodies[i];
			if (body2 !== body && body2.intersects(body)) {
				ignoreBodies.push(body2);
			}
		}
		intersection = 0;
		x = body.x + direction.cos * 1.9 << 0;
		if (x !== body.x) {
			x = body.x + (x > body.x ? 1: - 1);
		}
		y = body.y + direction.sin * 1.9 << 0;
		if (y !== body.y) {
			y = body.y + (y > body.y ? 1: - 1);
		}
		bodies = self.getBodies(x, y, body.width, body.height);
		for (i = 0; i < bodies.length; i++) {
			body2 = bodies[i];
			if (body2 !== body && body2.intersects(x, y, body.width, body.height)) {
				ignore = false;
				for (j = 0; j < ignoreBodies.length; j++) {
					if (body2 === ignoreBodies[j]) {
						ignore = true;
						break;
					}
				}
				if (!ignore) {
					intersection += body2.intersection(x, y, body.width, body.height);
				}
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
 * @Version 0.6
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
    this.power = 1;
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
	this.timer = 4;
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

Game.version = 0.6;

Game.prototype.getBomb = function(x, y) {
	for (var i = 0; i < this.bombs.length; i++) {
		if (this.bombs[i].x === x && this.bombs[i].y === y) {
			return this.bombs[i];
		}
	}
	return null;
};

Game.prototype.removeBodies = function(bodies, type) {
	var self = this;
	_.each(bodies, function(body) {
		if (body instanceof type) {
			self.removeBody(body);
		}
	});
};

Game.prototype.explodeBomb = function(bomb, data) {
	if (arguments.length === 1) {
		data = {
			x: bomb.x,
			y: bomb.y,
			bodies: [],
			fires: [],
            bombs: []
		};
	}
	var w = bomb.size * bomb.width,
	h = bomb.size * bomb.height,
	self = this,
	insertFire = function(x, y, firevar) {
		var d = function(e) {
			return e.x === x && e.y === y;
		};
		if (typeof _.detect(data.bodies, d) === 'undefined') {
			var fire = {
				x: x,
				y: y,
				firevar: firevar
			};
			var oldFire = _.detect(data.fires, d);
			if (typeof oldFire !== 'undefined') {
				if (oldFire.firevar !== 'c' && _.contains('c', 'v', 'h', fire.firevar)) {
					data.fires = _.without(data.fires, oldFire);
					data.fires.push(fire);
				}
			} else {
				data.fires.push(fire);
			}
		}
	};
    data.bombs.push(bomb);
	insertFire(bomb.x, bomb.y, 'c');
	var checkHit = function(xDir, yDir, firevar1, firevar2) {
		var xDiff = xDir * bomb.width,
		sx = bomb.x + xDiff,
		ex = bomb.x + bomb.size * xDiff,
		yDiff = yDir * bomb.height,
		sy = bomb.y + yDiff,
		ey = bomb.y + bomb.size * yDiff;
		actualCheck = function(x, y, firevar) {
			if (x >= 0 && y >= 0 && x < self.world.width && y < self.world.height) {
				var b = self.world.getBodies(x, y, bomb.width, bomb.height);
				for (var i = 0; i < b.length; i++) {
					var body = b[i];
					if (body !== bomb && body.intersects(x + 2, y + 2, bomb.width - 2, bomb.height - 2)) {
						if (body.armor > bomb.power) {
							return false;
						} else {
							if (! (body instanceof Bomb) && ! _.contains(data.bodies, body)) {
								data.bodies.push(body);
							}
							if (body.armor === bomb.power) {
								return false;
							}
						}
						if ((body instanceof Bomb) && !_.contains(data.bombs, body)) {
							self.explodeBomb(body, data);
						}
					}
				}
				insertFire(x, y, firevar);
			}
			return true;
		};

		for (var x = sx; x !== ex + xDiff; x += xDiff) {
			if (!actualCheck(x, bomb.y, x !== ex ? firevar1: firevar2)) {
				break;
			}
		}
		for (var y = sy; y !== ey + yDiff; y += yDiff) {
			if (!actualCheck(bomb.x, y, y !== ey ? firevar1: firevar2)) {
				break;
			}
		}
	};

	checkHit( - 1, 0, 'h', 'l');
	checkHit(1, 0, 'h', 'r');
	checkHit(0, - 1, 'v', 'u');
	checkHit(0, 1, 'v', 'd');

	return data;
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
			b.armor = 2;
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
var utils = {};
utils.log = function(cmd, msg) {
	if (arguments.length === 1) {
		msg = cmd;
		cmd = msg.cmd;
	}
	if (typeof console !== 'undefined' && console !== null) {
		console.log(cmd, msg);
	}
	msg = cmd + ' - ' + msg.result;
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
	$infoArea.attr('scrollTop', $infoArea.attr('scrollHeight'));
};

$(function() {
	var version = 0.1;

	$infoArea = $('#infoArea');
	var httpClient = new HttpClient(),
	socketClient = new SocketClient(),
	gameHandler = new GameHandler(lobbyHandler, socketClient),
	lobbyHandler = new LobbyHandler(gameHandler, httpClient, socketClient),
	gamePanel = new GamePanel(gameHandler),
	lobbyPanel = new LobbyPanel(lobbyHandler);
	utils.log({cmd: 'versions', result: 'OGE: ' + OGE.version + '. Game: ' + Game.version + '. Client: ' + version});
});

LobbyHandler = function(gameHandler, httpClient, socketClient) {
	var httpClient = new HttpClient(this),
	user;

	this.createGame = function(fn) {
		httpClient.createGame(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				gameHandler.startGame(game, user.nick);
				fn(true);
			} else {
				fn(fale);
			}
		});
	};

	this.playNow = function(fn) {
		httpClient.playNow(function(data) {
			if (data.result === 'OK') {
				var game = Game.deserialize(data.data);
				gameHandler.startGame(game, user.nick);
				fn(true);
			} else {
				fn(false);
			}
		});

	};

	this.login = function(nick, fn) {
		httpClient.login(nick, function(data) {
			if (data.result === 'OK') {
				user = data.data;
				socketClient.send('authPlayer', {
					guid: user.guid
				});
				fn(true);
			} else {
				fn(false);
			}
		});
	};
};

HttpClient = function() {
	var user;

	this.createGame = function(fn) {
		$.getJSON('/lobby?cmd=createGame&guid=' + user.guid, function(data) {
			utils.log('createGame', data);
			fn(data);
		});
	};

	this.playNow = function(fn) {
		$.getJSON('/lobby?cmd=joinGame&guid=' + user.guid, function(data) {
			utils.log('playNow', data);
            fn(data);
		});
	};

	this.login = function(nick, fn) {
		$.getJSON('/lobby?cmd=loginPlayer&nick=' + nick, function(data) {
			utils.log('loginPlayer', data);
			if (data.result === 'OK') {
				user = data.data;
			}
			fn(data);
		});
	};
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
				$nickField.blur();
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
					$nickField.focus();
					$loginPanel.children('span').text('Nick taken!');
				}
			});
		}
	};

	init();
};

GameHandler = function(lobbyHandler, socketClient) {
	var game, player, factorialTimer;
	listeners = {};

	this.addListener = function(trigger, fn) {
		if (typeof listeners[trigger]  === 'undefined') {
			listeners[trigger] = [];
		}
		listeners[trigger].push(fn);
	};

	this.removeBody = function(body) {
		game.removeBody(body);
	};

	this.startGame = function(newGame, nick) {
		game = newGame;
		player = game.getPlayer(nick);
		factorialTimer = new FactorialTimer();
        var time = new Date().getTime(), fps, gameTime;
        var frames = 0;
		factorialTimer.start(function() {
            time = new Date().getTime() - time;
            gameTime = new Date().getTime();
			game.world.step();
            gameTime = new Date().getTime() - gameTime;
            var fps = Math.floor(1000 / time);
			_.each(listeners['step'], function(callback) {
				callback(time, fps, gameTime);
			});
            time = new Date().getTime();
		});
		_.each(listeners['startGame'], function(callback) {
			callback(game);
		});
	};

	this.startMove = function(cos, sin) {
		if (!player.dead) {
			player.direction = new OGE.Direction(cos, sin);
			socketClient.send('startMove', {
				cos: cos,
				sin: sin,
				x: player.x,
				y: player.y
			});
		}
	};

	this.endMove = function() {
		if (!player.dead) {
			player.direction = null;
			socketClient.send('endMove', {
				x: player.x,
				y: player.y
			});
		}
	};

	this.placeBomb = function() {
		if (!player.dead) {
			if (player.bombs > 0) {
				//player.bombs--;
				var bomb = new Bomb(Math.floor((player.x + 8) / 16) * 16, Math.floor((player.y + 8) / 16) * 16, 16, 16);
                bomb.size = 2;
				game.addBody(bomb);
				bomb.power = player.power;
				socketClient.send('placeBomb', {
					x: bomb.x,
					y: bomb.y
				});
				return bomb;
			}
		}
	};

	socketClient.addListener('joinGame', function(result, data) {
		p = Player.deserialize(data.player);
		game.addBody(p, true);

		_.each(listeners['addPlayer'], function(callback) {
			callback(p);
		});
	});

	socketClient.addListener('startMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = new OGE.Direction(data.cos, data.sin);
		p.x = data.x;
		p.y = data.y;
	});

	socketClient.addListener('endMove', function(result, data) {
		p = game.getPlayer(data.player);
		p.direction = null;
		p.x = data.x;
		p.y = data.y;
	});

	socketClient.addListener('logoutPlayer', function(result, data) {
		p = game.getPlayer(data.player);
		p.$img.remove();
		game.removeBody(p);
	});

	socketClient.addListener('placeBomb', function(result, data) {
		var bomb = new Bomb(data.x, data.y, 16, 16);
		game.addBody(bomb);
		_.each(listeners['placeBomb'], function(callback) {
			callback(bomb);
		});
	});

	socketClient.addListener('explodeBomb', function(result, data) {
		var bomb = game.getBomb(data.x, data.y);
		game.getPlayer(data.player).bombs++;
		if (bomb !== null) {
			var data = game.explodeBomb(bomb);
            game.removeBodies(data.bombs, Bomb);
			if (_.include(data.bodies, player)) {
				//player.dead = true;
				//game.removeBody(player);
				_.each(listeners['meDead'], function(callback) {
				//	callback(player);
				});
                player.x = 0;
                player.y = 0;
				socketClient.send('playerDead', {});
			}
			_.each(listeners['explodeBomb'], function(callback) {
				callback(bomb, data);
			});
		}
	});

	socketClient.addListener('playerDead', function(result, data) {
		var p = game.getPlayer(data.player);
		//game.removeBody(p);
        p.x = 0;
        p.y = 0;
		_.each(listeners['playerDead'], function(callback) {
			//callback(p);
		});
	});

	socketClient.addListener('resurectPlayer', function(result, data) {
		var p = game.getPlayer(data.player);
		game.addBody(p);
		_.each(listeners['resurectPlayer'], function(callback) {
			callback(p);
		});
	});
};

SocketClient = function() {
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
		utils.log(msg);
		_.each(listeners[msg.cmd], function(fn) {
			fn(msg.result, msg.data);
		});
	});
};

GamePanel = function(gameHandler) {
	var $gamePanel = $('#gamePanel'),
	$fpsLabel = $('#fpsLabel'),
	keyboardHandler,
	fires = [],
	firebricks = [],
    version = 0.1;

	gameHandler.addListener('startGame', function(game) {
		keyboardHandler = new KeyboardHandler();

		$gamePanel.find('*').remove();
		$gamePanel.show();

		$gamePanel.width(game.world.width).height(game.world.height);

		_.each(game.blocks, function(block) {
			addBody(block, 'objects');
		});

		_.each(game.bricks, function(brick) {
			addBody(brick, 'objects');
			brick.offsetSprite = 1;
			setBackgroundPosition(brick);
		});

		_.each(game.players, function(player) {
			addPlayer(player);
		});

		keyboardHandler.keydown(function(dir) {
			var cos = 0,
			sin = 0;
			switch (dir) {
			case 'space':
				var bomb = gameHandler.placeBomb();
				if ( !! bomb) {
					placeBomb(bomb);
				}
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

		var frame = 0;
		gameHandler.addListener('step', function(time, fps, gameTime) {
			var visualTime = new Date().getTime();
			_.each(game.players, function(p) {
				if (p.animate === 0 && p.direction !== null && p.speed > 0) {
					p.animate = 5;
					p.sprite = 0;
				} else if (p.animate > 0 && p.direction === null || p.speed === 0) {
					p.animate = 0;
				}
				animateBody(p);
			});
			_.each(game.bombs, function(bomb) {
				animateBody(bomb);
			});
			_.each(fires, function(fire) {
				animateBody(fire);
                if (lastAnimation(fire)) {
					fires = _.without(fires, fire);
					fire.$img.remove();
				}
			});
			_.each(firebricks, function(firebrick) {
				animateBody(firebrick);
                if (lastAnimation(firebrick)) {
					firebricks = _.without(firebricks, firebrick);
					firebrick.$img.remove();
                    gameHandler.removeBody(firebrick);
                }
			});
			if (++frame === 20) {
				visualTime = new Date().getTime() - visualTime;
				$fpsLabel.text('Total time: ' + time + '. Engine time: ' + gameTime + '. Drawing time: ' + visualTime + ' . fps: ' + fps);
				frame = 0;
			}
		});

		gameHandler.addListener('explodeBomb', function(bomb, data) {
			_.each(data.bombs, function(b) {
				b.$img.remove();
			});
			_.each(data.fires, function(fire) {
				var os = 0,
				f = fire.firevar;
				switch (f) {
				case 'l':
					os = 2;
					break;
				case 'r':
					os = 3;
					break;
				case 'u':
					os = 4;
					break;
				case 'd':
					os = 1;
					break;
				case 'h':
					os = 5;
					break;
				case 'v':
					os = 6;
					break;
				}
				addBody(fire, 'fires');
				fire.direction = null,
				fire.sprites = [0, 1, 2, 3];
				fire.offsetSprite = os;
				fire.animate = 5;
				fires.push(fire);

			});
			_.each(data.bodies, function(body) {
				if (body instanceof Box) {
					body.animate = 5;
					body.sprite = 0;
					body.offsetSprite = 1;
					body.sprites = [1, 2];
					body.animateTimer = 10;
					firebricks.push(body);
				} else if (body instanceof Bomb) {
					body.$img.remove();
				}
			});
		});
	});

	gameHandler.addListener('addPlayer', function(player) {
		addPlayer(player);
	});

	gameHandler.addListener('placeBomb', function(bomb) {
		placeBomb(bomb);
	});

	gameHandler.addListener('meDead', function(player) {
		player.$img.remove();
	});

	gameHandler.addListener('playerDead', function(player) {
		player.$img.remove();
	});

	gameHandler.addListener('resurectPlayer', function(player) {
		$gamePanel.append(player.$img);
	});

	var addBody = function(body, image) {
		var $img = $('<div>').css('background', 'url(images/' + image + '.png)').css('left', body.x).css('top', body.y).addClass('body');
		body.$img = $img;
		body.sprite = 0;
		body.offsetSprite = 0;
		body.animate = 0;
		body.animateCount = 0;
		body.sprites = [0];
		body.animateTimer = 5;
		setBackgroundPosition(body);
		$gamePanel.append($img);
		return $img;
	};

	var addPlayer = function(player) {
		addBody(player, 'pb').addClass('player');
		player.sprites = [0, 1, 0, 2];
	};

	var placeBomb = function(bomb) {
		addBody(bomb, 'objects');
		bomb.sprites = [0, 1, 2];
		bomb.animate = 5;
		bomb.offsetSprite = 2;
	};

	var animateBody = function(b) {
		if (b.direction !== null && b.speed > 0) {
			b.$img.css('left', b.x).css('top', b.y - 4);
		}
		if (b.animate > 0) {
			if (b.lastDirection !== b.direction) {
				b.animate = 0;
				b.lastDirection = b.direction;
			}
			if (--b.animate <= 0) {
				b.animate = b.animateTimer;
				if (++b.sprite >= b.sprites.length) {
					b.sprite = 0;
				}
				var y = 0;
				if (b.direction !== null) {
					if (b.direction.cos !== 0) {
						y = b.direction.cos > 0 ? 3: 2;
					} else if (b.direction.sin !== 0) {
						y = b.direction.sin > 0 ? 0: 1;
					}
				}
				setBackgroundPosition(b, y);
			}
		}
	};

	var setBackgroundPosition = function(body, y) {
		if (arguments.length === 1) {
			y = 0;
		}
		body.$img.css('background-position', ( - (18 * (y + body.offsetSprite))) + 'px ' + ( - (22 * body.sprites[body.sprite])) + 'px');
	};

	var lastAnimation = function(body) {
		return (body.sprite === body.sprites.length - 1 && body.animate === 1);
	};
};

KeyboardHandler = function() {
	var keyCode, keydown, keyup;

	this.keydown = function(callback) {
		keydown = callback;
		return this;
	};

	this.keyup = function(callback) {
		keyup = callback;
		return this;
	};

	$(document).keydown(function(e) {
		var dir = null;
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
		if (dir !== null) {
			if (keyCode !== e.keyCode) {
				keyCode = dir !== 'space' ? e.keyCode : keyCode;
				keydown(dir);
			}
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
	callback;

	this.start = function(callbackFn) {
		callback = callbackFn;
		setInterval(step, sleepTime);
	};

	var step = function() {
		/*
		time = Math.floor((new Date().getTime() - time) * 0.9 + lastTime * 0.1);
		lastTime = time;
		if (time > 50 && sleepTime > 45) {
			sleepTime--;
		} else if (time < 50 && sleepTime < 55) {
			sleepTime++;
		}
		time = new Date().getTime();
        */
		callback();

	};
};

