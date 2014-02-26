var touchOrder = 0;
imMatch.extend(imMatch.event, {
    fixTouchMouseEvent: function(event, touchMouse) {
        touchMouse.identifier = touchMouse.identifier || 0;
        touchMouse.pageX = touchMouse.pageX || 0;
        touchMouse.pageY = touchMouse.pageY || 0;
        touchMouse.timestamp = touchMouse.timestamp || Date.now();

        return new imMatch.Event(event, {
                    id: touchMouse.identifier,
                    x: touchMouse.pageX / imMatch.device.ppi,
                    y: touchMouse.pageY / imMatch.device.ppi,
                    order: touchOrder++,
                    spriteID: null,
                    deviceID: imMatch.device.id,
                    frame: 0, // TODO
                    timestamp: touchMouse.timestamp
                });
    }
});

// Alias
imMatch.each(("touchstart touchmove touchend touchcancel").split(" "), function(i, name) {

    // Handle event binding
    imMatch.fn[name] = function(data, fn) {
        return arguments.length > 0 ?
            this.on(name, null, data, fn) :
            this.trigger(name);
    };
});
