bb.client = (function() {
    var dnode = new DNode({

        register: function(player) {
            bb.player = player;
            $('#connect').slideUp();
            $('#login').slideDown();
        },

        game: function(gameData) {
            var game = Game.deserialize(gameData, bb.player);
            bb.lobby.hide();
            bb.panel.sartGame(game);
            bb.keyboard.enabled = true;
            console.log(game);
        },

        joinGame: function(playerData) {
            var player = Player.deserialize(playerData);
            game.addBody(player, true);
            bb.panel.addPlayer(player);
        },

        leave: function(publicGuid) {
            var player = game.getPlayer(publicGuid);
            if (player !== null) {
                bb.panel.addPlayer(player);
                game.removeBody(player);
            }
        },

        move: function(publicGuid, x, y, direction) {
            var player = game.getPlayer(publicGuid);
            player.direction = direction !== null ? OGE.Direction.deserialize(direction) : null;
            player.x = x;
            player.y = y;
            if (direction !== null) {
                bb.panel.startMove(player, direction.dir);
            } else {
                bb.panel.endMove(player);
            }
        },

        addBomb: function(bombData) {
            var bomb = Bomb.deserialize(bombData);
            bombs[bomb.guid] = bomb;
            game.addBody(bomb);
            bb.panel.addBomb(bomb);
        },

        explodeBomb: function(bombGuid) {
            var bomb = bombs[bombGuid];
            if (bomb) {
                var data = game.explodeBomb(bomb);
                game.removeBodies(data.bombs, Bomb);
                bb.panel.explodeBomb(data);
            }
        }
    });

    function connect() {
        dnode.connect(function(remote) {
            $.each(remote, function(key) {
                bb.client[key] = remote[key];
            });
        });
    }

    return {
        connect: connect
    };

} ());

