describe("General testing of objects in the game", function() {
	it("should be possible to create a player", function() {
		isBody(new Player(1, 2, 3, 4), 1, 2, 3, 4);
		expect(new Player().nick).not.toBeDefined();
		expect(new Player(1, 2, 3, 4).nick).not.toBeDefined();
		expect(new Player("foo").nick).toBe("foo");
		expect(new Player(1, 2, 3, 4, "bar").nick).toBe("bar");
	});
	it("should be possible to create a box", function() {
		isBody(new Box(1, 2, 3, 4), 1, 2, 3, 4);
		expect(new Box().armor).toBe(1);
	});
	it("should be possible to create a bomb", function() {
		isBody(new Bomb(1, 2, 3, 4), 1, 2, 3, 4);
		expect(new Bomb().size).toBe(1);
	});
	it("should be possible to create a fire", function() {
		isBody(new Fire(1, 2, 3, 4), 1, 2, 3, 4);
		expect(new Fire().power).toBe(1);
	});
	it("should be possible to create a powerup", function() {
		isBody(new Powerup(1, 2, 3, 4), 1, 2, 3, 4);
	});

	var isBody = function(obj, x, y, width, height) {
		expect(obj.x).toBe(x);
		expect(obj.y).toBe(y);
		expect(obj.width).toBe(width);
		expect(obj.height).toBe(height);
		expect(obj instanceof OGE.Body).toBeTruthy();
	};
});

