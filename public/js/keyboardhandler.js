keyboard = (function() {
    var enabled = false,
    keyCode;

    self.init = function() {
        $(document).keydown(function(e) {
            if (enabled && keyCode !== e.keyCode) {
                keyCode = e.keyCode !== 32 ? e.keyCode: keyCode;
                switch (e.keyCode) {
                case 32:
                    bb.ingame.space();
                    break;
                case 37:
                case 65:
                    bb.ingame.cos( - 1);
                    break;
                case 38:
                case 87:
                    bb.ingame.sin( - 1);
                    break;
                case 39:
                case 68:
                    bb.ingame.cos(1);
                    break;
                case 40:
                case 83:
                    bb.ingame.sin(1);
                    break;
                }
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return true;
        }).keyup(function(e) {
            if (enabled && e.keyCode === keyCode) {
                keyCode = 0;
                bb.ingame.keyup();
            }
        }).keypress(function(e) {
            switch (e.keyCode) {
            case 32:
            case 37:
            case 38:
            case 39:
            case 40:
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        });
    };
} ());

