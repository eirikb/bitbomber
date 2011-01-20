describe("Game", function() {

    it("should be possible to add players", function() {
        var g = new Game(100, 100);
        g.addBody(new Player("foo"));
    });

    it("should be possible to serialize a game", function() {
        var g = new Game(100, 100).createBlocks(16).createBricks(16, 50);
        console.log(g.serialize());
    });
});
