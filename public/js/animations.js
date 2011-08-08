bb.animations = (function() {
    var playerAnimations = [],
    playerTypes = 2,
    playerColors = 4,
    fireAnimations = [],
    playerAnimation = function(direction, numberOfFrame) {
        var animations = [],
        typeAnimations,
        color,
        type;
        for (type = 0; type < playerTypes; type++) {
            typeAnimations = [];
            for (color = 0; color < playerColors; color++) {
                typeAnimations.push(new $.gameQuery.Animation({
                    imageURL: 'images/players.png',
                    numberOfFrame: numberOfFrame,
                    delta: 22,
                    rate: 120,
                    type: $.gameQuery.ANIMATION_VERTICAL,
                    offsetx: direction * 18 + color * (4 * 18),
                    offsety: type * (4 * 22)
                }));
            }
            animations.push(typeAnimations);
        }
        return animations;
    },
    blockSprite = new $.gameQuery.Animation({
        imageURL: 'images/objects.png'
    }),
    brickSprite = new $.gameQuery.Animation({
        imageURL: 'images/objects.png',
        offsetx: 18
    }),
    bombAnimation = new $.gameQuery.Animation({
        imageURL: 'images/objects.png',
        numberOfFrame: 3,
        delta: 22,
        rate: 120,
        offsetx: 2 * 18,
        type: $.gameQuery.ANIMATION_VERTICAL
    }),
    fireAnimation = function(spriteX) {
        return new $.gameQuery.Animation({
            imageURL: 'images/fires.png',
            numberOfFrame: 4,
            delta: 22,
            rate: 120,
            type: $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK,
            offsetx: 18 * spriteX
        });
    },
    fireBrick = new $.gameQuery.Animation({
        imageURL: 'images/objects.png',
        numberOfFrame: 2,
        delta: 22,
        rate: 360,
        type: $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK,
        offsetx: 18,
        offsety: 22
    });

    playerAnimations.left = playerAnimation(2, 4);
    playerAnimations.left_idle = playerAnimation(2, 1);
    playerAnimations.up = playerAnimation(1, 4);
    playerAnimations.up_idle = playerAnimation(1, 1);
    playerAnimations.right = playerAnimation(3, 4);
    playerAnimations.right_idle = playerAnimation(3, 1);
    playerAnimations.down = playerAnimation(0, 4);
    playerAnimations.down_idle = playerAnimation(0, 1);

    fireAnimations.c = fireAnimation(0);
    fireAnimations.d = fireAnimation(1);
    fireAnimations.l = fireAnimation(2);
    fireAnimations.r = fireAnimation(3);
    fireAnimations.u = fireAnimation(4);
    fireAnimations.h = fireAnimation(5);
    fireAnimations.v = fireAnimation(6);

} ());

