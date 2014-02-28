var isTouchSupported = "ontouchstart" in window,
    TouchMouseEvent = {
        DOWN: "touchmousedown",
        UP: "touchmouseup",
        MOVE: "touchmousemove",
        CANCEL: "touchmousecancel"
    },
    isMouseDragged = returnFalse,
    mouseID = 0;

jQuery.extend(imMatch, {
    touchMouseHandler: function(event) {
        jQuery.each(event.changedTouches, function(i, touch) {
            var touchMouseEvent = imMatch.fixTouchMouseEvent(event, touch),
                globalTouchMouse = imMatch.viewport.transformFromLocal2Global(touchMouseEvent);

            touchMouseEvent.x = globalTouchMouse.x;
            touchMouseEvent.y = globalTouchMouse.y;

            imMatch.logInfo("[" + touchMouseEvent.type + "] " + touchMouseEvent.x + ", " + 
                touchMouseEvent.y + "(" + touchMouseEvent.id + ")");

            imMatch.socketClient.caches.queue("touchMouseEvent", touchMouseEvent, function(a, b) {
                return a.order - b.order;
            });
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
            identifier: mouseID, 
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

        mouseID = Math.uuidFast();
        
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
    },

    addTouchMouseHandlers: function() {
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
    }
});