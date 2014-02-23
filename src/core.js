var imMatch = {};

jQuery.extend(imMatch, jQuery);

imMatch.extend({
    // Determine if object is a 2D vector
    is2DVector: function(object) {
        if (object == null) {
            return false;
        }
        
        return (imMatch.isNumeric(object.x) && imMatch.isNumeric(object.y));
    }
});