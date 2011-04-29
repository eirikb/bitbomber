var http = require('http'),
nodeStatic = require('node-static'),
url = require('url'),
players = require('players'),
games = require('games'),
ingame = require('ingame'),
nowjs = require('now');
port = 9706;

var server = http.createServer(function(req, res) {
    var publicFiles = new nodeStatic.Server('public', {
        cache: false
    }), sharedFiles = new nodeStatic.Server('shared', {
        cache: false
    });

    publicFiles.serve(req, res, function (e) {
        if (e) {
            sharedFiles.serve(req, res);
        }
    });
});

var everyone = nowjs.initialize(server);

everyone.now.register = players.register;
everyone.now.playNow = games.playNow;
everyone.now.startEndMove = ingame.startEndMove;
everyone.now.placeBomb = ingame.placeBomb;

everyone.on('disconnect', function(clientId) {
    games.logout(clientId);
    players.logout(clientId);
});

server.listen(port);
console.log('Server running at ' + port);
