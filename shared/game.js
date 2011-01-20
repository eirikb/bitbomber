/**
 * Game object
 *
 * @constructur
 * @return {Game}
 */
Game = function(width, height) {
	this.world = new OGE.World(width, height);
	this.players = [];
	this.bombs = [];
	this.fires = [];
	this.blocks = [];
	this.bricks = [];

	this.maxPlayers = 4;

	var self = this;

	this.addBody = function(body, active) {
		if (!self.world.addBody(body, active)) {
			return false;
		}
		if (body instanceof Player) {
			if (self.players.length == self.maxPlayers) {
				return false;
			} else if (self.players.length === 0) {
				self.owner = body;
			}
			self.players.push(body);
		} else if (body instanceof Bomb) {
			self.bombs.push(bomb);
		}
		return true;
	};

	this.serialize = function() {
		var data = {
			width: self.world.width,
			height: self.world.height
		};
		var getPos = function(obj, size) {
			return Math.floor(obj.y / size * self.world.width / size + obj.x / size);
		};
		var addBoxes = function(boxes, name) {
			if (boxes.length > 0) {
				data[name + 'Size'] = boxes[0].width;
				data[name] = [];
				_.each(boxes, function(box) {
					data[name].push(getPos(box, boxes[0].width));
				});
			}
		};
		data.players = [];
		_.each(self.players, function(player) {
			data.players.push({
				nick: player.nick,
				x: player.x,
				y: player.y
			});
		});

		addBoxes(self.blocks, 'blocks');
		addBoxes(self.bricks, 'bricks');
		return data;
	};

	this.removeBody = function(body) {
		self.world.removeBody(body);
		self.players = _.without(self.players, body);
		self.bombs = _.without(self.bombs, body);
		self.blocks = _.without(self.blocks, body);
		self.bricks = _.without(self.bricks, body);
	};

	this.createBlocks = function(size) {
		for (var y = 1; y < self.world.height / size - 2; y += 2) {
			for (var x = 1; x < self.world.width / size - 2; x += 2) {
				var b = new Box(x * size, y * size, size, size);
				b.armor = 1;
				self.blocks.push(b);
				self.addBody(b);
			}
		}
		return self;
	};

	this.createBricks = function(size, percentage) {
		var w = self.world.width / size;
		var h = self.world.height / size;
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				if (Math.random() * 100 < percentage && ! (x % 2 === 1 && y % 2 === 1)) {
					if ((x > 1 || y > 1) && (x > 1 || y < h - 2) && (x < w - 2 || y > 1) && (x < w - 2 || y < h - 2)) {
						var c = new Box(x * size, y * size, size, size);
						self.bricks.push(c);
						self.addBody(c);
					}
				}
			}
		}
		return self;
	};
};

