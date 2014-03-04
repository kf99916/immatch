imMatch.localGesture = {
    // {touchMouseEvent.id: sprite}
    spriteMap: {},

    recognize: function(touchMouseEvent) {
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return null;
        }

        return this[handler](touchMouseEvent);
    },

    touchmousedownHandler: function(touchMouseEvent) {
        var sprite = this.searchTouchedSprite(touchMouseEvent);
        if (jQuery.isEmptyObject(sprite)) {
            return null;
        }

        this.spriteMap[touchMouseEvent.id] = sprite;
        sprite.cursorGroup.add(new imMatch.Cursor(touchMouseEvent));
        return sprite;
    },

    touchmousemoveHandler: function(touchMouseEvent) {
        var sprite = this.spriteMap[touchMouseEvent.id], cursor;
        if (jQuery.isEmptyObject(sprite)) {
            return null;
        }

        cursor = sprite.cursorGroup.cursors[touchMouseEvent.id];
        if (jQuery.isEmptyObject(cursor)) {
            return null;
        }
        cursor.add(touchMouseEvent);
        
        return sprite;
    },

    touchmouseupHandler: function(touchMouseEvent) {
        var sprite = this.touchmousemoveHandler(touchMouseEvent);
        delete this.spriteMap[touchMouseEvent.id];
        return sprite;
    },

    touchmousecancelHandler:function(touchMouseEvent) {
        return this.touchmouseupHandler(touchMouseEvent);
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