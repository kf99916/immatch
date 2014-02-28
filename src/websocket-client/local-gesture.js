imMatch.localGesture = {
    // {touchMouseEvent.id: sprite}
    spriteMap: {},

    recognize: function(touchMouseEvent) {
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return;
        }

        this[handler](touchMouseEvent);
    },

    touchmousedownHandler: function(touchMouseEvent) {
        var sprite = this.searchTouchedSprite(touchMouseEvent);
        if (jQuery.isEmptyObject(sprite)) {
            return;
        }

        this.spriteMap[touchMouseEvent.id] = sprite;
        sprite.touchMouseEvents[touchMouseEvent.id] = touchMouseEvent;
    },

    touchmousemoveHandler: function(touchMouseEvent) {
        var sprite = this.spriteMap[touchMouseEvent.id];
        if (jQuery.isEmptyObject(sprite)) {
            return;
        }

        sprite.updateTransform(touchMouseEvent);
    },

    touchmouseupHandler: function(touchMouseEvent) {
    },

    touchmousecancelHandler:function(touchMouseEvent) {
    },

    searchTouchedSprite: function(touchMouseEvent) {
        var result;
        jQuery.each(imMatch.scenes, function(i, scene) {
            if (!scene.isTouched(touchMouseEvent)) {
                return;
            }

            jQuery.each(scene.sprites, function(i, sprite) {
                if (sprite.touchable && sprite.isTouched(touchMouseEvent)) {
                    result = sprite;
                    return false;
                }
            });
        });

        return result;
    }
};