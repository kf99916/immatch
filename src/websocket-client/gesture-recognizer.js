imMatch.gestureRecognizer = {
    recognize: function(stamp) {
        // 1. Get all touchMouseEvent in the frame
        var touchedSprite,
            touchMouseEvents = imMatch.socketClient.caches.getNRemove("touchMouseEvent", function(touchMouseEvent) {
                    return (touchMouseEvent.frame == stamp.frame);
                });

        if (touchMouseEvents.length == 0) {
            touchOrder = 0;
            imMatch.engine.frame = 0;
        }

        jQuery.each(touchMouseEvents, function(i, touchMouseEvent) {
            // 2. Synchronous Gesture Recognition
            imMatch.syncGesture.recognize(touchMouseEvent);

            // 3. Local Gesture Recognition
            touchedSprite = touchedSprite || imMatch.localGesture.recognize(touchMouseEvent);
        });

        return touchedSprite;
    }
};