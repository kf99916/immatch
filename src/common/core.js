/**
 * Core module
 * @module Core Module
 */
jQuery.extend(imMatch, {
    isReady: returnFalse,

    /**
     * Document is loaded and all of need imgas are also loaded. Then invoke the function.
     * @param {Function} fn The invoked function
     * @memberof! imMatch#
     */
    ready: function(fn) {
        if (imMatch.isReady()) {
            return this;
        }

        jQuery(document).ready(function() {
            imMatch.loader.load(fn);
        });

        return this;
    },

    /**
     * Determines whether the test object is a 2D vector or not.
     * @param {Object} object Test object
     * @returns {Bool} Result True if the object is a 2D vector; otherwise, false.
     * @memberof! imMatch#
     */
    is2DVector: function(object) {
        if (jQuery.isEmptyObject(object)) {
            return false;
        }

        return (jQuery.isNumeric(object.x) && jQuery.isNumeric(object.y));
    },

    /**
     * Determines whether the test object is undefined or null or not.
     * @param {Object} object Test object
     * @returns {Bool} Result True if the object is undefined or null; otherwise, false.
     * @memberof! imMatch#
     */
    isEmpty: function(object) {
        return (object === undefined || object === null);
    },

    /**
     * Removes a element from a plaint object or an array-like object.
     * @param {Object} object A plaint object or an array-like object
     * @param {String} name Removed property name
     * @returns {Object} Result Object which the property is removed
     * @memberof! imMatch#
     */
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