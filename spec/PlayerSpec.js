describe("Player", function() {
    it("should inherig OGE.Body", function() {
        var p1 = new Player(10, 11, 12, 13, "foo");
        var p2 = new Player("bar");
        expect(p1.x).toBe(10);
        expect(p1.y).toBe(11);
        expect(p1.width).toBe(12);
        expect(p1.height).toBe(13);
        expect(p1.name).toBe("foo");

        expect(p2.width).toBe(1);
        expect(p2.height).toBe(1);
        expect(p2.name).toBe("bar");
    });
});
