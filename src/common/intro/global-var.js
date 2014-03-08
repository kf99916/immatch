function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

function generatePrefixMessage(mode) {
    return "[" + mode.toUpperCase() + "] " + Date() + " :";
}

Date.now = Date.now || function now() { return new Date().getTime(); };

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,

    arr = [],

    stringify = JSON.stringify,

    slice = arr.slice,

    indexOf = arr.indexOf,

    push = arr.push,

    unshift = arr.unshift,

    imMatch = jQuery({});

jQuery.extend(imMatch, {
    coordinate: {
        local: 0,
        global: 1,
        scene: 2,
        sprite: 3
    }
});