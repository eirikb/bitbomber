describe("Game", function() {

	it("should be possible to add players", function() {
		var g = new Game(100, 100);
		g.addBody(new Player("foo"));
	});

	it("should be possible to serialize a game", function() {
		var g = new Game(100, 100).createBlocks(16).createBricks(16, 50);
		g.addBody(new Player(15, 24, 16, 16, "Oh, hai"), true);
		expect(Game.deserialize(g.serialize())).toEqual(g);
	});

	it("should be possible to know what items got blown up by a bomb", function() {
		var g = new Game(100, 100);
		var p1 = new Player(0, 0, 16, 16, "p1");
		var p2 = new Player(64, 64, 16, 16, "p3");
		var p3 = new Player(64, 32, 16, 16, "p4");
		var p4 = new Player(48, 48, 16, 16, "p5");

		g.addBody(p1, true);
		g.addBody(p2, true);
		g.addBody(p3, true);
		g.addBody(p4, true);

		g.bricks = [
		new Box(16, 0, 16, 16), new Box(48, 32, 16, 16), new Box(32, 48, 16, 16), new Box(16, 64, 16, 16)];
		g.bricks[0].armor = 2;

		_.each(g.bricks, function(brick) {
			g.addBody(brick);
		});

		var b1 = new Bomb(16, 16, 16, 16);
		var b2 = new Bomb(16, 48, 16, 16);
		var b3 = new Bomb(0, 48, 16, 16);
		var b4 = new Bomb(0, 32, 16, 16);
		var b5 = new Bomb(32, 32, 16, 16);
		var b6 = new Bomb(32, 0, 16, 16);
		var b7 = new Bomb(48, 0, 16, 16);
		var b8 = new Bomb(64, 0, 16, 16);
		b1.size = 2;
		b2.size = 2;
		b4.size = 2;
		b5.size = 3;
		b7.size = 4;
		b8.size = 4;
		g.addBody(b1);
		g.addBody(b2);
		g.addBody(b3);
		g.addBody(b4);
		g.addBody(b5);
		g.addBody(b6);
		g.addBody(b7);
		g.addBody(b8);

		expect(g.getBomb(32, 32)).toBe(b5);
		expect(g.players.length).toBe(4);
		expect(g.bricks.length).toBe(4);
		var data = g.explodeBomb(b1);
		expect(data.bodies.length).toBe(6);
		g.removeBodies(data.bodies, Box);
		g.removeBodies(data.bodies, Player);
		expect(g.players.length).toBe(1);
		expect(g.bricks.length).toBe(1);

		expect(g.getBomb(32, 32)).toBe(b5);
        g.removeBodies(data.bombs, Bomb);
		expect(g.getBomb(32, 32)).toBe(null);
	});

});
describe("Game - general bomb testing", function() {
	it("should block fires if it is a box", function() {
		var g = new Game(100, 100),
		addBomb = function(x, y, power, size) {
			var bomb = new Bomb(x, y, 10, 10);
			bomb.power = power;
			bomb.size = size;
			g.addBody(bomb);
			return bomb;
		},
		addBox = function(x, y, armor) {
			var box = new Box(x, y, 10, 10);
			box.armor = armor;
			g.addBody(box);
			return box;
		},
		b1 = addBox(20, 10, 1),
		b2 = addBox(10, 20, 2),
		b3 = addBox(30, 20, 3),
		b4 = addBox(20, 30, 4),
		b = addBomb(20, 20, 1, 1);
		var data = g.explodeBomb(b);
		expect(data.bodies.length).toBe(1);
        expect(data.fires.length).toBe(1);
        expect(g.world.getBodies(b1)).toContain(b1);

        b.size = 2;
        data = g.explodeBomb(b);
        expect(data.bodies.length).toBe(1);
        expect(data.fires.length).toBe(1);
        expect(g.world.getBodies(b1)).toContain(b1);
        expect(data.bombs.length).toBe(1);

        g.removeBodies(data.bodies, Box);
        expect(g.world.getBodies(b1)).not.toContain(b1);

        data = g.explodeBomb(b);
        expect(data.bodies.length).toBe(0);
        expect(data.fires.length).toBe(3);

        addBomb(20, 0, 1, 2);
        addBomb(40, 0, 1, 2);
        addBomb(40, 20, 10, 1);
        data = g.explodeBomb(b);
        expect(data.bodies.length).toBe(1);
        expect(data.fires.length).toBe(13);
        expect(data.bombs.length).toBe(4);
        expect(g.world.getBodies(b4)).toContain(b4);
        g.removeBodies(data.bodies, Box);
        expect(g.world.getBodies(b4)).toContain(b4);

        var gf = function(data, x, y) {
            return _.detect(data.fires, function(fire) {
                return fire.x === x && fire.y === y;
            });
        };

        expect(g.world.getBodies(b4)).toContain(b4);
        expect(gf(data, 20, 20).firevar).toBe('c');
        expect(gf(data, 20, 10).firevar).toBe('v');
        expect(gf(data, 20, 0).firevar).toBe('c');
        expect(gf(data, 10, 0).firevar).toBe('h');
        expect(gf(data, 30, 0).firevar).toBe('h');
        expect(gf(data, 40, 0).firevar).toBe('c');
        expect(gf(data, 50, 0).firevar).toBe('h');
        expect(gf(data, 40, 10).firevar).toBe('v');
        expect(gf(data, 40, 20).firevar).toBe('c');
        expect(gf(data, 50, 20).firevar).toBe('r');
        expect(gf(data, 40, 30).firevar).toBe('d');
	});
});

