jQuery.extend(imMatch, {
    fixTouchMouseEvent: function(event, touchMouse) {
        touchMouse.identifier = touchMouse.identifier || 0;
        touchMouse.pageX = touchMouse.pageX || 0;
        touchMouse.pageY = touchMouse.pageY || 0;
        touchMouse.timestamp = touchMouse.timestamp || Date.now();

        // Local Coordinate: The origin is initialized as the upper left corner of imMatch.viewport
        return new jQuery.Event(event, {
                    id: touchMouse.identifier,
                    x: touchMouse.pageX / imMatch.device.ppi,
                    y: touchMouse.pageY / imMatch.device.ppi,
                    order: touchOrder++,
                    spriteID: null,
                    deviceID: imMatch.device.id,
                    frame: imMatch.engine.frame,
                    timestamp: touchMouse.timestamp
                });
    }
});

// Alias
jQuery.each(("touchstart touchmove touchend touchcancel").split(" "), function(i, name) {

    // Handle event binding
    jQuery.fn[name] = function(data, fn) {
        return arguments.length > 0 ?
            this.on(name, null, data, fn) :
            this.trigger(name);
    };
});
