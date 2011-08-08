bb.panel = (function() {
    var $gamePanel = $('#game'),
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

    function addPlayer(player) {
        $('#players').addSprite("player-" + player.publicGuid, {
            animation: playerAnimations['down-idle'][player.type][player.color],
            width: 18,
            height: 22,
            posx: player.x,
            posy: player.y
        });
        $('#player-' + player.publicGuid)[0].player = player;
    }

    function removePlayer(player) {
        $('#player-' + player.publicGuid).remove();
    }

    function startGame(game) {
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
    }

    function startMove(player, dir) {
        $('#player-' + player.publicGuid).setAnimation(playerAnimations[dir][player.type][player.color]);
        player.lastDir = dir;
    }

    function endMove(player) {
        $('#player-' + player.publicGuid).setAnimation(playerAnimations[player.lastDir + '-idle'][player.type][player.color]);
    }

    function addBomb(bomb) {
        $('#background').addSprite('bomb-' + bomb.guid, {
            animation: bombAnimation,
            width: 16,
            height: 16,
            posx: bomb.x,
            posy: bomb.y
        });
    }

    function explodeBomb(data) {
        $.each(data.bombs, function(b) {
            $('#bomb-' + b.guid).remove();
        });
        $.each(data.fires, function(fire) {
            addBody(fire, 'fire', fireAnimations[fire.firevar], function(e) {
                $(e).remove();
            });
        });
        $.each(data.bodies, function(body) {
            if (body instanceof Box) {
                $('#' + body.name).remove();
                addBody(body, 'firebrick', fireBrick, function(e) {
                    gameHandler.removeBody(body);
                    $(e).remove();
                });
            }
        });
    }

    return {
        startGame: startGame
    };
} ());

