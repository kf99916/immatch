var isTouchSupported = "ontouchstart" in window,
    TouchMouseEvent = {
        DOWN: "touchmousedown",
        UP: "touchmouseup",
        MOVE: "touchmousemove",
        CANCEL: "touchmousecancel"
    },
    isMouseDragged = returnFalse,
    mouseId = -1;

imMatch.extend({
    touchMouseHandler: function(event) {
        imMatch.each(event.changedTouches, function(i, touch) {
            var touchMouseEvent = imMatch.event.fixTouchMouseEvent(event, touch);
            // 1. Synchronous Gesture Recognition
            imMatch.syncGesture.recognize(touchMouseEvent);
            // 2. Put touchMouseEvents into the touchMouseEvent pool
            //imMatch.socketClient.putPool(touchMouseEvent);
        });
    },
    // Touch Handlers
    touchstartHandler: function(event) {
        event.type = TouchMouseEvent.DOWN;
        imMatch.touchMouseHandler(event);
    },
    touchmoveHandler: function(event) {
        event.type = TouchMouseEvent.MOVE;
        imMatch.touchMouseHandler(event);
    },
    touchendHandler: function(event) {
        event.type = TouchMouseEvent.UP;
        imMatch.touchMouseHandler(event);
    },
    touchcancelHandler: function(event) {
        event.type = TouchMouseEvent.CANCEL;
        imMatch.touchMouseHandler(event);
    },
    // Mouse Handlers
    mouseHandler: function(event) {
        event.changedTouches = [{
            identifier: mouseId, 
            pageX: event.pageX, 
            pageY: event.pageY
        }];
        imMatch.touchMouseHandler(event);
    },
    mousedownHandler: function(event) {
        if (isMouseDragged()) {
            return;
        }

        isMouseDragged = returnTrue;
        event.type = TouchMouseEvent.DOWN;
        mouseId++;
        imMatch.mouseHandler(event);
    },
    mousemoveHandler: function(event) {
        if (!isMouseDragged()) {
            return;
        }

        event.type = TouchMouseEvent.MOVE;
        imMatch.mouseHandler(event);
    },
    mouseupHandler: function(event) {
        if (!isMouseDragged()) {
            return;
        }

        isMouseDragged = returnFalse;
        event.type = TouchMouseEvent.UP;
        imMatch.mouseHandler(event);
    },
    mouseoutHandler: function(event) {
        if (!isMouseDragged()) {
            return;
        }

        isMouseDragged = returnFalse;
        event.type = TouchMouseEvent.CANCEL;
        imMatch.mouseHandler(event);
    }
});

if (isTouchSupported) {
    imMatch.event.add(window, "touchstart", imMatch.touchstartHandler);
    imMatch.event.add(window, "touchmove", imMatch.touchmoveHandler);
    imMatch.event.add(window, "touchend", imMatch.touchendHandler);
    imMatch.event.add(window, "touchcancel", imMatch.touchcancelHandler);
}
else {
    imMatch.event.add(window, "mousedown", imMatch.mousedownHandler);
    imMatch.event.add(window, "mousemove", imMatch.mousemoveHandler);
    imMatch.event.add(window, "mouseup", imMatch.mouseupHandler);
    imMatch.event.add(window, "mouseout", imMatch.mouseoutHandler);
}