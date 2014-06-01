/**
 * Event
 * @module Event
 */

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

// Alias functions of touch events for jQuery
jQuery.each(("touchstart touchmove touchend touchcancel").split(" "), function(i, name) {

    // Handle event binding
    jQuery.fn[ name ] = function( data, fn ) {
        return arguments.length > 0 ?
            this.on( name, null, data, fn ) :
            this.trigger( name );
    };
});

/**
 * Alias functions of registering "touchmousechange" event or triggering "touchmousechange" event
 * @function
 * @name imMatch#touchmousechange
 */

/**
 * Alias functions of registering "trytostitch" event or triggering "trytostitch" event
 * @function
 * @name imMatch#trytostitch
 */

/**
 * Alias functions of registering "modechange" event or triggering "modechange" event
 * @function
 * @name imMatch#modechange
 */

/**
 * Alias functions of registering "stitching" event or triggering "stitching" event
 * @function
 * @name imMatch#stitching
 */
jQuery.each(("touchmousechange trytostitch modechange stitching").split(" "), function(i, name) {

    // Handle event binding
    imMatch[name] = function(data, fn) {
        return arguments.length > 0 ?
            imMatch.on(name, null, data, fn) :
            imMatch.trigger(name);
    };
});
