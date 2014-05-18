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

        if (sprite.cursorGroup.numCursors > maxNumTouchesInSprite) {
            return null;
        }

        this.spriteMap[touchMouseEvent.id] = sprite;

        sprite.cursorGroup.add(new imMatch.Cursor(sprite.scene.transformWithCoordinate(touchMouseEvent, true)));
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

        cursor.add(sprite.scene.transformWithCoordinate(touchMouseEvent, true));
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
        var result, scenes = slice.call(imMatch.scenes);

        imMatch.logDebug("TouchMouseEvent @ Global: ", touchMouseEvent.x, touchMouseEvent.y, touchMouseEvent.coordinate);

        jQuery.each(scenes.reverse(), function(i, scene) {
            var touchMouseEventInScene = scene.transformWithCoordinate(touchMouseEvent, true), sprites;

            imMatch.logDebug("TouchMouseEvent @ Scene: ",
                touchMouseEventInScene.x, touchMouseEventInScene.y, touchMouseEventInScene.coordinate);

            if (scene.solid && !scene.isTouched(touchMouseEventInScene)) {
                return;
            }

            sprites = slice.call(scene.sprites);
            jQuery.each(sprites.reverse(), function(i, sprite) {
                var touchMouseEventInSprite = sprite.transformWithCoordinate(touchMouseEventInScene, true);

                imMatch.logDebug("TouchMouseEvent @ Sprite: ",
                    touchMouseEventInSprite.x, touchMouseEventInSprite.y, touchMouseEventInSprite.coordinate);

                if (sprite.isTouched(touchMouseEventInSprite)) {
                    result = sprite;
                    return false;
                }
            });
        });

        return result;
    }
};