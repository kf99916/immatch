jQuery.extend(imMatch, {
    touchMouseEventType: {
        down: "touchmousedown",
        up: "touchmouseup",
        move: "touchmousemove",
        cancel: "touchmousecancel"
    },

    touchMouseHandler: function(event) {
        jQuery.each(event.changedTouches, function(i, touch) {
            var touchMouseEvent = imMatch.fixTouchMouseEvent(event, touch),
                globalTouchMouse = imMatch.viewport.transformWithCoordinate(touchMouseEvent);

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
        event.type = imMatch.touchMouseEventType.down;
        imMatch.touchMouseHandler(event);
    },

    touchmoveHandler: function(event) {
        event.type = imMatch.touchMouseEventType.move;
        imMatch.touchMouseHandler(event);
    },

    touchendHandler: function(event) {
        event.type = imMatch.touchMouseEventType.up;
        imMatch.touchMouseHandler(event);
    },

    touchcancelHandler: function(event) {
        event.type = imMatch.touchMouseEventType.cancel;
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
        event.type = imMatch.touchMouseEventType.down;

        mouseID = Math.uuidFast();
        
        imMatch.mouseHandler(event);
    },

    mousemoveHandler: function(event) {
        if (!isMouseDragged()) {
            return;
        }

        event.type = imMatch.touchMouseEventType.move;
        imMatch.mouseHandler(event);
    },

    mouseupHandler: function(event) {
        if (!isMouseDragged()) {
            return;
        }

        isMouseDragged = returnFalse;
        event.type = imMatch.touchMouseEventType.up;
        imMatch.mouseHandler(event);
    },

    mouseoutHandler: function(event) {
        if (!isMouseDragged()) {
            return;
        }

        isMouseDragged = returnFalse;
        event.type = imMatch.touchMouseEventType.cancel;
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