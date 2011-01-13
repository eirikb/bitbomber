/**
 * Game object
 *
 * @constructur
 * @return {Game}
 */
Game= function() {
    this.bodies = [];

    /**
     * Add a body to game
     *
     * @param {OGE.Body} body Body to add
     */
    this.addBody = function(body) {
        for (var i = 0; i < this.bodies.length; i++) {
            if (this.bodies[i] === body) {
                return;
            }
        }
        this.bodies.push(body);
    };

    /**
     * Remove body from game
     *
     * @param {OGE.Body} body Body to remove
     */
    this.removeBody = function(body) {
        for (var i = 0; i < this.bodies.length; i++) {
            if (this.bodies[i] === body) {
                this.bodies.splice(i, 1);
                break;
            }
        }
    };
};
