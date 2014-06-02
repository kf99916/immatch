/**
 * Bind window's touch or mouse events
 * @module Bind Toch Event
 */

jQuery.extend(imMatch, {
    /**
     * Determines whether touches are supported in the device.
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    isTouchSupported: "ontouchstart" in window,

    /**
     * The current mouse ID.
     * @private
     * @default
     * @memberof! imMatch#
     */
    mouseID: null,

    /**
     * Determines whether the mouse is dragged or not.
     * @private
     * @default
     * @memberof! imMatch#
     */
    isMouseDragged: returnFalse,

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    touchMouseEventType: {
        down: "touchmousedown",
        up: "touchmouseup",
        move: "touchmousemove",
        cancel: "touchmousecancel"
    },

    /**
     * The handler to handle all of touch or mouse event.
     * It helps transform the touch or mouse point from the local coordinate to the global coordinate.
     * "touchmousechange" event is triggered.
     * @param {Object} event A normalized touch or mouse event
     * @memberof! imMatch#
     */
    touchMouseHandler: function(event) {
        event.preventDefault();
        jQuery.each(event.originalEvent.changedTouches, function(i, touch) {
            var touchMouseEvent = imMatch.fixTouchMouseEvent(event, touch);

            imMatch.viewport.transformWithCoordinate(touchMouseEvent);

            imMatch.logInfo("[" + touchMouseEvent.type + "] " + touchMouseEvent.x + ", " +
                touchMouseEvent.y + "(" + touchMouseEvent.id + ")");

            imMatch.socketClient.caches.queue("touchMouseEvent", touchMouseEvent, function(a, b) {
                return a.order - b.order;
            });

            /**
             * @name imMatch#touchmousechange
             * @event
             * @param {Object} touchMouseEvent A changed touchMouseEvent which is located at the global coordinate
             */
            imMatch.trigger("touchmousechange", touchMouseEvent);
        });
    },

    /**
     * The handler to handle the touchstart event
     * @param {Object} event A touch event
     * @memberof! imMatch#
     */
    touchstartHandler: function(event) {
        event.type = imMatch.touchMouseEventType.down;
        imMatch.touchMouseHandler(event);
    },

    /**
     * The handler to handle the touchmove event
     * @param {Object} event A touch event
     * @memberof! imMatch#
     */
    touchmoveHandler: function(event) {
        event.type = imMatch.touchMouseEventType.move;
        imMatch.touchMouseHandler(event);
    },

    /**
     * The handler to handle the touchend event
     * @param {Object} event A touch event
     * @memberof! imMatch#
     */
    touchendHandler: function(event) {
        event.type = imMatch.touchMouseEventType.up;
        imMatch.touchMouseHandler(event);
    },

    /**
     * The handler to handle the touchcancel event
     * @param {Object} event A touch event
     * @memberof! imMatch#
     */
    touchcancelHandler: function(event) {
        event.type = imMatch.touchMouseEventType.cancel;
        imMatch.touchMouseHandler(event);
    },

    /**
     * The handler to handle all of mouse event
     * @param {Object} event A mouse event
     * @memberof! imMatch#
     */
    mouseHandler: function(event) {
        event.originalEvent.changedTouches = [{
            identifier: imMatch.mouseID,
            pageX: event.pageX,
            pageY: event.pageY
        }];
        imMatch.touchMouseHandler(event);
    },

    /**
     * The handler to handle the mousedown event
     * @param {Object} event A mouse event
     * @memberof! imMatch#
     */
    mousedownHandler: function(event) {
        if (imMatch.isMouseDragged()) {
            return;
        }

        imMatch.isMouseDragged = returnTrue;
        event.type = imMatch.touchMouseEventType.down;

        imMatch.mouseID = Math.uuidFast();

        imMatch.mouseHandler(event);
    },

    /**
     * The handler to handle the mousemove event
     * @param {Object} event A mouse event
     * @memberof! imMatch#
     */
    mousemoveHandler: function(event) {
        if (!imMatch.isMouseDragged()) {
            return;
        }

        event.type = imMatch.touchMouseEventType.move;
        imMatch.mouseHandler(event);
    },

    /**
     * The handler to handle the mouseup event
     * @param {Object} event A mouse event
     * @memberof! imMatch#
     */
    mouseupHandler: function(event) {
        if (!imMatch.isMouseDragged()) {
            return;
        }

        imMatch.isMouseDragged = returnFalse;
        event.type = imMatch.touchMouseEventType.up;
        imMatch.mouseHandler(event);
    },

    /**
     * The handler to handle the mouseout event
     * @param {Object} event A mouse event
     * @memberof! imMatch#
     */
    mouseoutHandler: function(event) {
        if (!imMatch.isMouseDragged()) {
            return;
        }

        imMatch.isMouseDragged = returnFalse;
        event.type = imMatch.touchMouseEventType.cancel;
        imMatch.mouseHandler(event);
    },

    /**
     * Adds handlers to handle touch event or mouse event to windows object.
     * @memberof! imMatch#
     */
    addTouchMouseHandlers: function() {
        if (this.isTouchSupported) {
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