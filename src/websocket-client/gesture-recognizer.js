imMatch.gestureRecognizer = {
    recognize: function(stamp) {
        // 1. Get all touchMouseEvent in the frame
        var touchedSprites = [], currentTouchedSprite, inTouchedSprites = false,
            touchMouseEvents = imMatch.socketClient.caches.getNRemove("touchMouseEvent", function(touchMouseEvent) {
                    return (touchMouseEvent.frame == stamp.frame);
                });

        if (touchMouseEvents.length == 0) {
            imMatch.touchOrder = 0;
            imMatch.engine.frame = 0;
        }

        jQuery.each(touchMouseEvents, function(i, touchMouseEvent) {
            inTouchedSprites = false;
            // 2. Synchronous Gesture Recognition
            imMatch.syncGesture.recognize(touchMouseEvent);

            // 3. Local Gesture Recognition
            currentTouchedSprite = imMatch.localGesture.recognize(touchMouseEvent);
            jQuery.each(touchedSprites, function(i, touchedSprite) {
                if (currentTouchedSprite.id == touchedSprite.id) {
                    inTouchedSprites = true;
                    return false;
                }
            });

            if (inTouchedSprites) {
                touchedSprites.push(currentTouchedSprite);
            }
        });

        // 4. touchedSprites Update their Affine Transform
        jQuery.each(touchedSprites, function (i, touchedSprite) {
            touchedSprite.updateAffineTransform();
            touchedSprite.updateCursorGroup();
        });

        return touchedSprites;
    }
};