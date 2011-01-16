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

	var self = this;

	this.addBody = function(body, active) {
		self.world.addBody(body, active);
		if (body instanceof Player) {
			self.players.push(body);
		} else if (body instanceof Bomb) {
			self.bombs.push(bomb);
		}
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

