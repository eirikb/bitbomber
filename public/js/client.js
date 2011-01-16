var game;
var player;

$(function() {
	var $gamePanel = $('#gamePanel');
	$.getJSON('/lobby?command=join&nick=eirikb', function(data) {
		console.log(data);
	});
	/*
	var bodyImages = {};
	var keyCode = 0;

	$gamePanel.width(640);

	game = new Game(640, 480).
	createBlocks(16).
	createBricks(16, 30);

	var addBody = function(body, image) {
		var $img = $("<img>").
		attr("src", "images/" + image + ".png").
		css("left", body.x).
		css("top", body.y).
		addClass("body");
		$gamePanel.append($img);
		bodyImages[body] = $img;
	};

	$.each(game.blocks, function(i, block) {
		addBody(block, "block");
	});

	$.each(game.bricks, function(i, brick) {
		addBody(brick, "brick");
	});

	player = new Player(0, 0, 16, 16);
	game.addBody(player, true);
	addBody(player, "pl1");

	$(document).keydown(function(e) {
		var cos = 0,
		sin = 0;
		switch (e.keyCode) {
		case 37:
			cos = - 1;
			break;
		case 38:
			sin = - 1;
			break;
		case 39:
			cos = 1;
			break;
		case 40:
			sin = 1;
			break;
		}
		if (cos !== 0 || sin !== 0) {
			keyCode = e.keyCode;
			player.direction = new OGE.Direction(cos, sin);
			return false;
		}
	}).keyup(function(e) {
		if (e.keyCode === keyCode) {
			player.direction = null;
		}
	});

	var step = function() {
		game.world.step();
		$.each(game.players, function(i, player) {
			var $img = bodyImages[player];
			$img.css("left", player.x).css("top", player.y - 4);
		});
		setTimeout(step, 10);
	};

	step();
*/
});

