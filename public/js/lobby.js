bb.lobby = (function() {
    var $loginButton = $('#loginButton'),
    $nickField = $('#nickField'),
    $playNowButton = $('#playNowButton'),
    $createGameButton = $('#createGameButton');

    function login() {
        nick = $nickField.val();
        if (nick) {
            now.login(nick, function(ok) {
                $('#loginPanel').hide();
                $('#lobbyPanel').show();
            });
        }
    }

    $loginButton.click(function() {
        login();
    });

    $nickField.keypress(function(e) {
        if (e.keyCode === 13) {
            login();
        }
    });

    $playNowButton.click(function() {});

    $createGameButton.click(function() {
        createGame();
    });
} ());

