var express = require('express'),
dnode = require('dnode'),
openGames = [],
clients = {},
s4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

var app = express.createServer();
app.use(express.static('public'));
app.listen(5050);

function createPlayer() {
    return {
        guid: s4() + s4(),
        x: 0,
        y: 0,
        width: 48,
        height: 48,
        hp: 100,
        speed: 5
    };
}

function createGame() {
    return {
        guid: s4() + s4(),
        width: 900,
        height: 400,
        players: {}
    };
}

function getGame(client, guid) {
    var game = openGames[0];
    if (guid) {
        game = openGames.filter(function(g) {
            return g.guid === guid.substring(1)
        })[0];
        if (!game) {
            game = openGames[0];
        }
    }
    game.players[client.player.guid] = client.player;
    if (Object.keys(game.players).length === 3) {
        openGames = openGames.slice(1, openGames.indexOf(game));
    }
    client.game = game;
    return game;
}

function all(client, cb) {
    client.game.players.forEach(function(player) {
        cb(clients[player.guid]);
    });
}

function allX(client, cb) {
    client.game.players.filter(function(player) {
        return client.player !== player;
    }).forEach(function(player) {
        cb(clients[player.guid]);
    });
}

function updatePlayer(client, x, y) {
    client.player.x = x;
    client.player.y = y;
    return client.player;
}

dnode(function(client, con) {

    con.on('ready', function() {
        client.player = createPlayer();
        client.register(client.player);
    });

    con.on('end', function() {
        allX(client, function(c) {
            c.leave(client.player.guid);
        });
        delete client.game.players[client.player.guid];
    });

    this.setNick = function(nick)  {
        client.player.nick = nick;
    };

    this.playNow = function() {
        var game = getGame();
        if (!game) {
            game = createGame();
        }
        allX(function(c) {
            c.addPlayer(client.player);
        });
        c.game(game);
    };

    this.move = function(x, y, way) {
        var p = updatePlayer(client, x, y);
        allX(client, function(c) {
            c.move(p.guid, x, y, way);
        });
    };

    this.jumping = function(x, y, jumping) {
        var p = updatePlayer(client, x, y);
        allX(client, function(c) {
            c.jumping(p.guid, x, y, jumping);
        });
    };

    this.bullet = function(x, y, mx, my) {
        allX(client, function(c) {
            c.bullet(x, y, mx, my);
        });
    };

    this.hit = function() {
        client.player.hp -= 10;
        allX(client, function(c) {
            c.hit(client.player.guid);
        });
        if (client.player.hp <= 0) {
            client.player.hp = 100;
            client.player.x = Math.floor(Math.random() * 800);
            client.player.y = Math.floor(Math.random() * 100);
            all(client, function(c) {
                c.dead(client.player.guid, client.player.x, client.player.y);
            });
        }
    };

}).listen(app);

