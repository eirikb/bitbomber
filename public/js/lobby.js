bb.lobby = (function() {

} ());

$(function() {
    var $nickField = $('#nickField');

    function login() {
        nick = $nickField.val();
        if (nick) {
            bb.client.setNick(nick);
            $('#login').slideUp();
            $('#menu').slideDown();
        }
    }

    $('#loginButton').click(function() {
        login();
    });

    $nickField.keypress(function(e) {
        if (e.keyCode === 13) {
            login();
        }
    });

    $('#playNowButton').click(function() {
        console.log('PLAYNOW');
        $('#lobby').slideUp();
        $('#game').slideDown();
        bb.client.playNow();
    });

    $('#createGameButton').click(function() {
        createGame();
    });
});

