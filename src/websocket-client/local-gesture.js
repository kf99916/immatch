/**
 * Recognizes which sprtie performs the local gesture.
 * @namespace
 */
imMatch.localGesture = {
    /**
     * Stores sprite with touch ID key. {touchMouseEvent.id: sprite}
     * @default
     */
    spriteMap: {},

    /**
     * Recognize the touchMouseEvent.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    recognize: function(touchMouseEvent) {
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return null;
        }

        return this[handler](touchMouseEvent);
    },

    /**
     * Recognize the touchMouseEvent which the toch or mouse is down.
     * Searchs sprites which are touched and adds them into spriteMap.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    touchmousedownHandler: function(touchMouseEvent) {
        var sprite = this.searchTouchedSprite(touchMouseEvent);
        if (jQuery.isEmptyObject(sprite)) {
            return null;
        }

        if (sprite.cursorGroup.numCursors >= sprite.maxNumCursors) {
            return null;
        }

        this.spriteMap[touchMouseEvent.id] = sprite;

        sprite.cursorGroup.add(new imMatch.Cursor(sprite.scene.transformWithCoordinate(touchMouseEvent, true)));
        return sprite;
    },

    /**
     * Recognize the touchMouseEvent which the toch or mouse is moving.
     * Sprites which are touched perform affine transforam by the touchMouseEvent.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
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

    /**
     * Recognize the touchMouseEvent which the toch or mouse is up.
     * Sprites which are touched is removed from spriteMap.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    touchmouseupHandler: function(touchMouseEvent) {
        var sprite = this.touchmousemoveHandler(touchMouseEvent);
        delete this.spriteMap[touchMouseEvent.id];
        return sprite;
    },

    /**
     * Recognize the touchMouseEvent which the toch or mouse is cancelled.
     * Action is the same as touchmouseupHandler.
     * @see imMatch.localGesture.touchmouseupHandler
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    touchmousecancelHandler:function(touchMouseEvent) {
        return this.touchmouseupHandler(touchMouseEvent);
    },

    /**
     * Searchs sprites which are touched.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
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

            if (!imMatch.isEmpty(result)) {
                return false;
            }
        });

        return result;
    }
};