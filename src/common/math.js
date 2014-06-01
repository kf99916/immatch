/**
 * Math module
 * @module Math Module
 */
jQuery.extend(imMatch, {
    /**
     * Rotates the given point by rad with a specified point as the anchor point.
     * @param {Vector} point {x: float, y: float}
     * @param {Float} rad unit: Raidan
     * @param {Vector} center {x: float, y: float}. The defalut value is {x: 0, y: 0} (Optional)
     * @returns {Vector} Result Rotated vector {x: float, y: float}
     * @memberof! imMatch#
     */
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

    /**
     * Returns the largest argument or element in array and index.
     * @returns {Object} Result The max element
     * @memberof! imMatch#
     */
    max: function() {
        var target = arguments[0],
            result = {index:-1, value: +Infinity};

        if (!jQuery.isArrayLike(target)) {
            target = [];
            jQuery.each(arguments, function(i, argument) {
                push.call(target, argument);
            });
        }

        result.value = Math.max.apply(Math, target);
        result.index = indexOf.call(target, result.value);

        return result;
    },

    /**
     * Returns the smallest argument or element in array and index.
     * @returns {Object} Result The min element
     * @memberof! imMatch#
     */
    min: function() {
        var target = arguments[0],
            result = {index:-1, value: -Infinity};

        if (!jQuery.isArrayLike(target)) {
            target = [];
            jQuery.each(arguments, function(i, argument) {
                push.call(target, argument);
            });
        }

        result.value = Math.min.apply(Math, target);
        result.index = indexOf.call(target, result.value);

        return result;
    },

    /**
     * Computes Remainder.
     * @param {Int} dividend The dividend
     * @param {Int} divisor The divisor
     * @returns {Int} Result A positive number
     * @memberof! imMatch#
     */
    mod: function(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    },

    /**
     * Performs dot operation.
     * @param {Vector} vector1 {x: float, y: float}
     * @param {Vector} vector2 {x: float, y: float}
     * @returns {Float} Result Dot
     * @memberof! imMatch#
     */
    dot: function(vector1, vector2) {
        if (!imMatch.is2DVector(vector1) || !imMatch.is2DVector(vector2)) {
            return 1;
        }

        return (vector1.x * vector2.x + vector1.y * vector2.y);
    },

    /**
     * Comptes a radian between two given vectors
     * @param {Vector} vector1 {x: float, y: float}
     * @param {Vector} vector2 {x: float, y: float}
     * @returns {Float} Result Radian. -pi ~ pi
     * @memberof! imMatch#
     */
    rad: function(vector1, vector2) {
        if (!imMatch.is2DVector(vector1) || !imMatch.is2DVector(vector2)) {
            return 0;
        }

        return  Math.atan2(vector1.x * vector2.y - vector2.x * vector1.y , imMatch.dot(vector1, vector2));
    },

    /**
     * Performs norm operation
     * @param {Vector} vector {x: float, y: float}
     * @returns {Float} Result Norm
     * @memberof! imMatch#
     */
    norm: function(vector) {
        return Math.sqrt(imMatch.dot(vector, vector));
    },

    /**
     * Rounds off a number
     * @param {Float} number
     * @returns {Int} Result round number
     * @memberof! imMatch#
     */
    round: function(number) {
        if (!jQuery.isNumeric(number)) {
            return number;
        }

        return ~~(number + 0.5);
    }
});