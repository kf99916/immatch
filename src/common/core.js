jQuery.extend(imMatch, {
    isReady: returnFalse,

    ready: function(fn) {
        if (imMatch.isReady()) {
            return this;
        }

        jQuery(document).ready(function() {
            imMatch.loader.load(fn);
        });

        return this;
    },

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