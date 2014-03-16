jQuery.extend(imMatch, {
    fixTouchMouseEvent: function(event, touchMouse) {
        var jQueryEvent;
        touchMouse.identifier = touchMouse.identifier || 0;
        touchMouse.pageX = touchMouse.pageX || 0;
        touchMouse.pageY = touchMouse.pageY || 0;

        // Local Coordinate: The origin is initialized as the upper left corner of imMatch.viewport
        jQueryEvent =  new jQuery.Event(event, {
                        id: touchMouse.identifier,
                        x: touchMouse.pageX / imMatch.device.ppi,
                        y: touchMouse.pageY / imMatch.device.ppi,
                        order: touchOrder++,
                        coordinate: imMatch.coordinate.local,
                        deviceID: imMatch.device.id,
                        frame: imMatch.engine.frame
                    });

        delete jQueryEvent.originalEvent;
        return jQueryEvent;
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
