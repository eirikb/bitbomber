var $infoArea;

var utils = {};
utils.log = function(msg) {
	console.log(msg);
	if (msg.cmd && msg.result) {
		msg = msg.cmd + ' - ' + msg.result;
	}
	$infoArea.val($infoArea.val() + ($infoArea.val().length > 0 ? '\n': '') + msg);
};

$(function() {
	$infoArea = $('#infoArea');
	new LobbyClient();
});

