/**
 * Game object
 *
 * @constructur
 * @return {Game}
 */
Game = function(width, height) {
    this.world = new OGE.World(width, height);
    this.bombs = [];
    this.fires = [];

    var self = this;

    this.addBody = function(body) {
        self.world.addBody(body);
        if (body instanceof Bomb) {
            bombs.push(bomb);
        }
    };

    this.removeBody = function(body) {
        world.removeBody(body);
    };
};
