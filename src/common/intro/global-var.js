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

    mouseID = "",

    // Be reset if there is no any cursor group.
    cursorGroupID = 0,

    // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js
    touchOrder = 0,

    // Be reset if there is no any scene.
    sceneZ = 0,

    imMatch = jQuery({});