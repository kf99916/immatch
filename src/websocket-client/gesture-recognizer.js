imMatch.gestureRecognizer = {
    contextWillbeDrawnHandler: function(event, stamp) {
        // 1. Get all touchMouseEvent in the frame
        var touchMouseEvents = imMatch.socketClient.caches.get("touchMouseEvent", function(touchMouseEvent) {
            return (touchMouseEvent.frame == stamp.frame);
        });

       // console.log(touchMouseEvents);
/*
        jQuery.each(touchMouseEvents, function(i, touchMouseEvent) {
            // 1. Synchronous Gesture Recognition
            imMatch.syncGesture.recognize(touchMouseEvent);

            switch(imMatch.engine.mode) {
                case Mode.STITCHED:
                    // 2. Transform touchMouseEvent from a local coordinate to a global coordinate

                    // 3. Put touchMouseEvents into the touchMouseEvent cache for sync touchMouseEvent.

                break;
                case Mode.ALONE: default:
                    // It is not necessary to sync touchMouseEvent because no target to sync.
                    // 3. Local Gesture Recognition
                    imMatch.localGesture.recognize(touchMouseEvent);
                break;
            }
        });*/
    }
};

imMatch.on("contextWillbeDrawn", imMatch.gestureRecognizer.contextWillbeDrawnHandler);