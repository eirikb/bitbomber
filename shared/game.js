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

Game.version = 0.7;

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
						if ((body instanceof Bomb) && ! _.contains(data.bombs, body)) {
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
		height: this.world.height,
		guid: this.guid
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
	game.guid = data.guid;
	return game;
};

