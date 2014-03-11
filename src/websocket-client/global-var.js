var isTouchSupported = "ontouchstart" in window,

    isMouseDragged = returnFalse,

    maxNumTouchesInSprite = 2,

    mouseID = "",

    // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js
    touchOrder = 0,

    // Be reset if there is no any scene. Please check it in scene.js
    sceneZ = 0;

jQuery.extend(imMatch, {
    makeMode: function(mainMode, state) {
        mainMode = mainMode || 0;
        state = state || 0;
        return (mainMode << 24) | (state & 0xffff);
    },

    getMainMode: function(mode) {
        mode = mode || 0;
        return (mode >> 24);
    },

    getState: function(mode) {
        mode = mode || 0;
        return (mode & 0xffff);
    },

    mainMode: {
        alone: 0x01,
        stitching: 0x02,
        stitched: 0x04
    },

    state: {
        exchange: 1,
        done: 2,
        wait: 3
    },

    coordinate: {
        local: 0,
        global: 1,
        scene: 2,
        sprite: 3
    },

    chunkSize: 5
});

imMatch.mode = {
    alone: imMatch.makeMode(imMatch.mainMode.alone),

    stitching: {
            exchange: imMatch.makeMode(imMatch.mainMode.stitching, imMatch.state.exchange),
            done: imMatch.makeMode(imMatch.mainMode.stitching, imMatch.state.done),
            wait: imMatch.makeMode(imMatch.mainMode.stitching, imMatch.state.wait)
    },

    stitched: imMatch.makeMode(imMatch.mainMode.stitched)
};