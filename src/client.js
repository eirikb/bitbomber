var $infoArea;

var client;

var utils = {};
utils.log = function(msg) {
	if (msg.cmd && msg.result) {
		if (typeof console !== 'undefined' && console !== null) {
			console.log(msg.cmd, msg);
		}
		msg = msg.cmd + ' - ' + msg.result;
	} else {
		if (typeof console !== 'undefined' && console !== null) {
			console.log(msg);
		}
	}
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
	$infoArea.attr('scrollTop', $infoArea.attr('scrollHeight'));
};

$(function() {
	$infoArea = $('#infoArea');
	LobbyClient();
});

