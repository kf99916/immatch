var arr = [],

    stringify = JSON.stringify,

    slice = arr.slice;

var imMatch = jQuery({});

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

Date.now = Date.now || function now() { return new Date().getTime(); };

jQuery.extend(imMatch, {
    // Determine if object is a 2D vector
    is2DVector: function(object) {
        if (object == null) {
            return false;
        }
        
        return (jQuery.isNumeric(object.x) && jQuery.isNumeric(object.y));
    },

    // Determine if object is undefined or null
    isEmpty: function(object) {
        return (object === undefined || object === null);
    },

    // Remove a element from a plaint object or an array-like object
    remove: function(object, name) {
        if (jQuery.isEmptyObject(name)) {
            return object;
        }
        
        if (jQuery.isArray(object)) {
            slice.call(object, name, 1);
        }
        else if (jQuery.isPlainObject(object)) {
            delete object[name];
        }

        return object;
    }
});