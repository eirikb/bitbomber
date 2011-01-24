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
});

