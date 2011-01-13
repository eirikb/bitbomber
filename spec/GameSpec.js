describe("Game", function() {

    it("should be possible to add players", function() {
        var g = new Game(100, 100);
        g.addBody(new Player("foo"));
    });
});
