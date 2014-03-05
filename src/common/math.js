jQuery.extend(imMatch, {
    // Rotate (x, y) with a specified point as rotation center
    rotate: function(point, rad, /* Optional */ center) {
        var vec, cos, sin;
        if (!jQuery.isNumeric(rad) || rad === 0 || imMatch.isEmpty(point.x) || imMatch.isEmpty(point.y)) {
            return point;
        }

        center = center || {x:0, y:0};

        vec = {x: point.x - center.x, y: point.y - center.y};
        cos = Math.cos(rad);
        sin = Math.sin(rad);

        return {
            x: center.x + vec.x * cos - vec.y * sin,
            y: center.y + vec.x * sin + vec.y * cos
        };
    },

    // Return the largest argument or element in array and index
    max: function() {
        var target = arguments[0], 
            result = {index:-1, value: +Infinity};

        if (!jQuery.isArrayLike(target)) {
            target = [];
            jQuery.each(arguments, function(i, argument) {
                core_push.call(target, argument);
            });
        }

        result.value = Math.max.apply(Math, target);
        result.index = core_indexOf.call(target, result.value);

        return result;
    },

    // Return the smallest argument or element in array and index
    min: function() {
        var target = arguments[0], 
            result = {index:-1, value: -Infinity};

        if (!jQuery.isArrayLike(target)) {
            target = [];
            jQuery.each(arguments, function(i, argument) {
                core_push.call(target, argument);
            });
        }

        result.value = Math.min.apply(Math, target);
        result.index = core_indexOf.call(target, result.value);

        return result;
    },

    // Return value is a positive number
    mod: function(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    },

    dot: function(vector1, vector2) {
        if (!imMatch.is2DVector(vector1) || !imMatch.is2DVector(vector2)) {
            return 1;
        }

        return (vector1.x * vector2.x + vector1.y * vector2.y);
    },

    // Return 0 - pi
    rad: function(vector1, vector2) {
        if (!imMatch.is2DVector(vector1) || !imMatch.is2DVector(vector2)) {
            return 0;
        }

        var rad = Math.atan2(vector1.x * vector2.y - vector2.x * vector1.y , imMatch.dot(vector1, vector2));
        return Math.abs(rad);
    },

    norm: function(vector) {
        return Math.sqrt(imMatch.dot(vector, vector));
    }
});