var imMatch = {},

    stringify = JSON.stringify;

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

Date.now = Date.now || function now() { return new Date().getTime(); };

jQuery.extend(imMatch, jQuery);

imMatch.extend({
    // Determine if object is a 2D vector
    is2DVector: function(object) {
        if (object == null) {
            return false;
        }
        
        return (imMatch.isNumeric(object.x) && imMatch.isNumeric(object.y));
    },

    // Determine if object is undefined or null
    isEmpty: function(object) {
        return (object === undefined || object === null);
    }
});