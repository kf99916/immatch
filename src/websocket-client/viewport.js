/**
 * Creates a Viewport object.
 * @class
 * @classdesc Viewport is a transformable object and it represents the region a user can see.
 * @see imMatch.transformable
 * @constructor
 */
imMatch.Viewport = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Viewport) ) {
        return new imMatch.Viewport();
    }

    jQuery.extend(true, this, imMatch.transformable.members);

    this.id = Math.uuidFast();

    this.width = window.innerWidth / imMatch.device.ppi;
    this.height = window.innerHeight / imMatch.device.ppi;

    this.global2LocalTransform = imMatch.AffineTransform.getTranslationInstance({
        x: this.width / 2, y: this.height / 2});

    // Viewport is only movable
    this.movable = true;
    this.rotatable = true;

    this.frame = imMatch.AffineTransform.getScaleInstance({
                            x: imMatch.device.ppi,
                            y: imMatch.device.ppi}).
                            transform({x: this.width, y: this.height});
};

jQuery.extend(imMatch.Viewport.prototype, imMatch.transformable.prototype, {
    /**
     * Transforms a given vector with its coordinate to the global coordinate.
     * @param {Object} vec The given vector
     * @param {Boolean} deep Indicates whether the given vector can be overwritten by the rsult
     * @returns {Object} Result Result
     * @memberof! imMatch.Viewport#
     */
    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;

        switch(target.coordinate) {
            // Local -> Global
            case imMatch.coordinate.local:
                target.coordinate = imMatch.coordinate.global;
                result = this.inverseTransform(target);
            break;
            // Global -> Local
            case imMatch.coordinate.global:
                target.coordinate = imMatch.coordinate.local;
                result = this.transform(target);
            break;
            default:
                imMatch.logError("[imMatch.viewport.transformWithCoordinate] The coordinate is invalid! Coordinate: " + target.coordinate);
            break;
        }

        return jQuery.extend(target, result);
    },

    /**
     * Computes a affine transform to the local coordinate.
     * @returns {AffineTransform} Result A affine transform can transform the vector in the global coordinate to the local coordinate
     * @memberof! imMatch.Viewport#
     */
    computeAffineTransform2Local: function() {
        return this.computeAppliedTransform().inverse().preConcatenate(this.global2LocalTransform);
    },

    /**
     * Computes a affine transform for drawing the viewport object.
     * @returns {AffineTransform} Result A affine transform for drawing the viewport object
     */
    computeAffineTransformForDraw: function() {
        return this.global2LocalTransform;
    },

    /**
     * Transforms a given vector through the affine transform to the local coordinate.
     * @param {Vector} vec A vector
     * @returns {Vector} Result {x: float, y: float}
     */
    transform: function(vec) {
        return this.computeAffineTransform2Local().transform(vec);
    },

    /**
     * Inversely Transforms a given vector through the inverse matrix of affine transform to thel ocal coordinate.
     * @returns {Vector} Result {x: float, y: float}
     */
    inverseTransform: function(vec) {
        return this.computeAffineTransform2Local().inverse().transform(vec);
    },

    /**
     * Deserializes data to a viewport object.
     * @param {Object} data Serialized data
     * @returns {Object} Result A viewport object which including the serialized data
     */
    deserialize: function(data) {
        if (data.global2LocalTransform.length === 6) {
            this.global2LocalTransform = imMatch.AffineTransform.apply(this, data.global2LocalTransform);
            delete data.global2LocalTransform;
        }

        return jQuery.extend(this, data);
    },
});

/**
 * The current viewport.
 * @constant
 * @default
 * @memberof! imMatch#
 */
imMatch.viewport = new imMatch.Viewport();