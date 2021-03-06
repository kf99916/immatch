/**
 * Takes responsibility for recognizing the synchrouous gestures and the local gestures
 * @namespace
 */
imMatch.gestureRecognizer = {
    /**
     * Recognizes the synchrouous gestures and the local gestures
     * @param {Object} stamp Timestamp information
     * @memberof! imMatch.gestureRecognizer#
     */
    recognize: function(stamp) {
        // 1. Get all touchMouseEvent in the frame
        var touchMouseEventCache = (imMatch.getMainMode(imMatch.engine.mode) === imMatch.mainMode.alone)?
                "touchMouseEvent" : "syncTouchMouseEvent",
            touchedSprites = [], currentTouchedSprite, inTouchedSprites = false,
            touchMouseEvents = imMatch.socketClient.caches.getNRemove(touchMouseEventCache, function(touchMouseEvent) {
                    return (touchMouseEvent.frame === stamp.frame);
                });

        if (touchMouseEvents.length === 0) {
            touchOrder = 0;
        }

        jQuery.each(touchMouseEvents, function(i, touchMouseEvent) {
            inTouchedSprites = false;
            // 2. Synchronous Gesture Recognition
            imMatch.syncGesture.recognize(touchMouseEvent);

            // 3. Local Gesture Recognition
            currentTouchedSprite = imMatch.localGesture.recognize(touchMouseEvent);
            if (jQuery.isEmptyObject(currentTouchedSprite)) {
                return;
            }

            // 4. Update touchedSprites
            jQuery.each(touchedSprites, function(i, touchedSprite) {
                if (currentTouchedSprite.id === touchedSprite.id) {
                    inTouchedSprites = true;
                    return false;
                }
            });

            if (!inTouchedSprites) {
                push.call(touchedSprites, currentTouchedSprite);
            }
        });

        // 5. touchedSprites Update their Affine Transform
        jQuery.each(touchedSprites, function (i, touchedSprite) {
            touchedSprite.updateAffineTransform();
            touchedSprite.updateCursorGroup();
        });

        return touchedSprites;
    }
};