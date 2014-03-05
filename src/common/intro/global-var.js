function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

function fixMessage(message, mode) {
    return "[" + mode.toUpperCase() + "] " + Date() + " : " + message;
}

Date.now = Date.now || function now() { return new Date().getTime(); };

var 
    // Use the correct document accordingly with window argument (sandbox)
    document = window.document,
    arr = [],

    stringify = JSON.stringify,

    slice = arr.slice,

    isTouchSupported = "ontouchstart" in window,

    isMouseDragged = returnFalse,

    maxNumTouchesInSprite = 2,

    mouseID = "",

    // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js
    cursorGroupID = 0,

    // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js
    touchOrder = 0,

    // Be reset if there is no any scene. Please check it in scene.js
    sceneZ = 0,

    imMatch = jQuery({});

jQuery.extend(imMatch, {
    coordinate: {
        local: 0,
        global: 1,
        scene: 2,
        sprite: 3
    }
});