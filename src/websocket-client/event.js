imMatch.extend(imMatch.event, {
    fixTouchMouseEvent: function(event, touchMouse) {
        touchMouse.identifier = touchMouse.identifier || 0;
        touchMouse.pageX = touchMouse.pageX || 0;
        touchMouse.pageY = touchMouse.pageY || 0;
        touchMouse.timestamp = touchMouse.timestamp || new Date().getTime();

        return new imMatch.Event(event, {
                    id: touchMouse.identifier,
                    x: touchMouse.pageX / window.device.ppi,
                    y: touchMouse.pageY / window.device.ppi,
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
