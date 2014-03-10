var isTouchSupported = "ontouchstart" in window,

    isMouseDragged = returnFalse,

    maxNumTouchesInSprite = 2,

    mouseID = "",

    // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js
    touchOrder = 0,

    // Be reset if there is no any scene. Please check it in scene.js
    sceneZ = 0;

jQuery.extend(imMatch, {
    coordinate: {
        local: 0,
        global: 1,
        scene: 2,
        sprite: 3
    },

    chunkSize: 5
});