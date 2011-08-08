bb.panel = (function() {
    var $gamePanel = $('#gamePanel'),
    REFRESH_RATE = 30,
    count = 0;

    function addBody(body, name, animation, cb) {
        name += '-' + count++;
        $('#background').addSprite(name, {
            animation: animation,
            width: 16,
            height: 16,
            posx: body.x,
            posy: body.y,
            callback: cb
        });
        body.name = name;
    }

    function addBodies(bodies, name, animation) {
        $(bodies).each(function(i, body) {
            addBody(body, name, animation);
        });
    }

    var addPlayer = function(player) {
        $('#players').addSprite("player-" + player.publicGuid, {
            animation: playerAnimations['down-idle'][player.type][player.color],
            width: 18,
            height: 22,
            posx: player.x,
            posy: player.y
        });
        $('#player-' + player.publicGuid)[0].player = player;
    };

    var removePlayer = function(player) {
        $('#player-' + player.publicGuid).remove();
    };

    var startGame = function(game) {
        var self = this;
        $gamePanel.playground({
            width: game.world.width,
            height: game.world.height,
            refreshRate: REFRESH_RATE
        }).addGroup('players').addGroup('background');
        $(game.players).each(function(i, player) {
            self.addPlayer(player);
        });

        addBodies(game.blocks, 'block', blockSprite);
        addBodies(game.bricks, 'brick', brickSprite);

        $.playground().startGame().registerCallback(function() {
            $('#players > .sprite').each(function() {
                $(this).css('left', this.player.x).css('top', this.player.y - 6);
            });
            gameHandler.step();
        },
        REFRESH_RATE);
    };

    var startMove = function(player, dir) {
        $('#player-' + player.publicGuid).setAnimation(playerAnimations[dir][player.type][player.color]);
        player.lastDir = dir;
    };

    var endMove = function(player) {
        $('#player-' + player.publicGuid).setAnimation(playerAnimations[player.lastDir + '-idle'][player.type][player.color]);
    };

    var addBomb = function(bomb) {
        $('#background').addSprite('bomb-' + bomb.guid, {
            animation: bombAnimation,
            width: 16,
            height: 16,
            posx: bomb.x,
            posy: bomb.y
        });
    };

    var explodeBomb = function(data) {
        _.each(data.bombs, function(b) {
            $('#bomb-' + b.guid).remove();
        });
        _.each(data.fires, function(fire) {
            addBody(fire, 'fire', fireAnimations[fire.firevar], function(e) {
                $(e).remove();
            });
        });
        _.each(data.bodies, function(body) {
            if (body instanceof Box) {
                $('#' + body.name).remove();
                addBody(body, 'firebrick', fireBrick, function(e) {
                    gameHandler.removeBody(body);
                    $(e).remove();
                });
            }
        });
    };
} ());

