imMatch.gestureRecognizer = {
    contextWillbeDrawnHandler: function(event, stamp) {
        // 1. Get all touchMouseEvent in the frame
        var touchMouseEvents = imMatch.socketClient.caches.getNRemove("touchMouseEvent", function(touchMouseEvent) {
            return (touchMouseEvent.frame == stamp.frame);
        });

        jQuery.each(touchMouseEvents, function(i, touchMouseEvent) {
            // 2. Synchronous Gesture Recognition
            imMatch.syncGesture.recognize(touchMouseEvent);

            // 3. Local Gesture Recognition
            imMatch.localGesture.recognize(touchMouseEvent);
        });
    }
};

imMatch.on("contextWillbeDrawn", imMatch.gestureRecognizer.contextWillbeDrawnHandler);