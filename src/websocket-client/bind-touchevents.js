var isTouchSupported = "ontouchstart" in window,
    TouchMouseEvent = {
        DOWN: "touchmousedown",
        UP: "touchmouseup",
        MOVE: "touchmousemove",
        CANCEL: "touchmousecancel"
    },
    isMouseDragged = returnFalse,
    mouseId = -1;

jQuery.extend(imMatch, {
    touchMouseHandler: function(event) {
        jQuery.each(event.changedTouches, function(i, touch) {
            var touchMouseEvent = imMatch.fixTouchMouseEvent(event, touch);

            imMatch.logInfo("[" + touchMouseEvent.type + "] " + touchMouseEvent.x + ", " + 
                touchMouseEvent.y + "(" + touchMouseEvent.id + ")");

            imMatch.socketClient.caches.queue("touchMouseEvent", touchMouseEvent);
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
    jQuery(window).touchstart(imMatch.touchstartHandler);
    jQuery(window).touchmove(imMatch.touchmoveHandler);
    jQuery(window).touchend(imMatch.touchendHandler);
    jQuery(window).touchcancel(imMatch.touchcancelHandler);
}
else {
    jQuery(window).mousedown(imMatch.mousedownHandler);
    jQuery(window).mousemove(imMatch.mousemoveHandler);
    jQuery(window).mouseup(imMatch.mouseupHandler);
    jQuery(window).mouseout(imMatch.mouseoutHandler);
}