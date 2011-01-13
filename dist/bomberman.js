
/*!
 * The MIT License
 *
 * Copyright (c) 2011 Eirik Brandtzæg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Eirik Brandtzæg <eirikb@eirikb.no>
 * @Version 0.1
 */

// Prevent protoype inheritance from calling constructors twice when using apply
// Thanks to eboyjr (##javascript @ freenode)
Object.construct_prototype = function(o) {
    var f = function() {
    };

    f.prototype = o.prototype;
    return new f();
};
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
/**
 * Player object
 *
 * @constructur
 * @return {Player}
 */
Player = function(x, y, width, height, nick) {
    OGE.Body.apply(this, arguments);
    this.nick = nick;
    if (arguments.length === 1) {
        this.nick = arguments[0];
    }
    this.slide = true;
    this.bombSize = 1;
    this.bombPower =1;
    this.life = 3;
    this.armor = 0;
    this.bombs = 1;
};

Player.prototype = Object.construct_prototype(OGE.Body);
/**
 * Box object
 *
 * @constructur
 * @return {Box}
 */
Box = function(x, y, width, height) {
    OGE.Body.apply(this, arguments);
    this.armor = 1;
};

Box.prototype = Object.construct_prototype(OGE.Body);
/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */
Bomb = function(x, y, width, height) {
    OGE.Body.apply(this, arguments);
    this.size = 1;
    this.timer = 10;
    this.power = 1;
};

Bomb.prototype = Object.construct_prototype(OGE.Body);
/**
 * Fire object
 *
 * @constructur
 * @return {Fire}
 */
Fire = function(x, y, width, height) {
    OGE.Body.apply(this, arguments);
    this.timer = 10;
    this.power = 1;
};

Fire.prototype = Object.construct_prototype(OGE.Body);
/**
 * Powerup object
 *
 * @constructur
 * @return {Powerup}
 */
Powerup = function(x, y, width, height) {
    OGE.Body.apply(this, arguments);
};

Powerup.prototype = Object.construct_prototype(OGE.Body);
