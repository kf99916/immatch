/**
 * AffineTransform
 * @class
 * @classdesc AffineTransform helper.
 * Creates a affine transform object: <br>
 * [  m00  m01  m02  ] <br>
 * [  m10  m11  m12  ] <br>
 * [   0    0    1   ] <br>
 * {@link https://github.com/google/closure-library/blob/master/closure/goog/math/affinetransform.js|Reference}
 * @constructor
 * @param {Float} m00
 * @param {Float} m10
 * @param {Float} m01
 * @param {Float} m11
 * @param {Float} m02
 * @param {Float} m12
 */
imMatch.AffineTransform = function(m00, m10, m01, m11, m02, m12) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.AffineTransform) ) {
        return new imMatch.AffineTransform(m00, m10, m01, m11, m02, m12);
    }

    this.setTransform(m00, m10, m01, m11, m02, m12);
};

/**
 * Creates a scaling affine transform object.
 * @static
 * @param {Vector} scalingFactor {x: factor, y: factor}
 * @returns {AffineTransform} Result A scaling affine transform object
 */
imMatch.AffineTransform.getScaleInstance = function(scalingFactor) {
    return new imMatch.AffineTransform().setToScale(scalingFactor);
};

/**
 * Creates a translation affine transform object.
 * @static
 * @param {Vector} translationFactor {x: factor, y: factor}
 * @returns {AffineTransform} Result A translation affine transform object
 */
imMatch.AffineTransform.getTranslationInstance = function(translationFactor) {
    return new imMatch.AffineTransform().setToTranslation(translationFactor);
};

/**
 * Creates a shearing affine transform object.
 * @static
 * @param {Vector} shearFactor {x: factor, y: factor}
 * @returns {AffineTransform} Result A shearing affine transform object
 */
imMatch.AffineTransform.getShearInstance = function(shearFactor) {
    return new imMatch.AffineTransform().setToShear(shearFactor);
};

/**
 * Creates a rotation affine transform object which the rotation center is anchorPoint.
 * @static
 * @param {Float} rad unit: radian
 * @param {Vector} anchorPoint {x: float, y: float}
 * @returns {AffineTransform} Result A rotation affine transform object
 */
imMatch.AffineTransform.getRotateInstance = function(rad, anchorPoint) {
    return new imMatch.AffineTransform().setToRotation(rad, anchorPoint);
};

imMatch.AffineTransform.prototype = {
    /**
     * Setter
     * @param {Float} m00
     * @param {Float} m10
     * @param {Float} m01
     * @param {Float} m11
     * @param {Float} m02
     * @param {Float} m12
     * @returns {AffineTransform} Result A affine transform object
     */
    setTransform: function(m00, m10, m01, m11, m02, m12) {
        if (!jQuery.isNumeric(m00) || !jQuery.isNumeric(m01) || !jQuery.isNumeric(m02) ||
            !jQuery.isNumeric(m10) || !jQuery.isNumeric(m11) || !jQuery.isNumeric(m12)) {
            // Identity Matrix
            this.m00 = this.m11 = 1;
            this.m01 = this.m02 = this.m10 = this.m12 = 0;
            return this;
        }

        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m10 = m10;
        this.m11 = m11;
        this.m12 = m12;
        return this;
    },

    /**
     * Clones itself
     * @returns {AffineTransform} Result A affine transform object which values are the same.
     */
    clone: function() {
        return new imMatch.AffineTransform(this.m00, this.m10, this.m01, this.m11, this.m02, this.m12);
    },

    /**
     * Concatenates with a scaling affine transform <br>
     * [m00 m01 m02] [x 0 0] <br>
     * [m10 m11 m12] [0 y 0] <br>
     * [  0   0   1] [0 0 1]
     * @param {Vector} scalingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after concatenation
     */
    scale: function(scalingFactor) {
        return this.concatenate(imMatch.AffineTransform.getScaleInstance(scalingFactor));
    },

    /**
     * Pre-concatenates with a scaling affine transform <br>
     * [x 0 0] [m00 m01 m02] <br>
     * [0 y 0] [m10 m11 m12] <br>
     * [0 0 1] [  0   0   1]
     * @param {Vector} scalingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preScale: function(scalingFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getScaleInstance(scalingFactor));
    },

    /**
     * Concatenates with a translation affine transform <br>
     * [m00 m01 m02] [1 0 x] <br>
     * [m10 m11 m12] [0 1 y] <br>
     * [  0   0   1] [0 0 1]
     * @param {Vector} translationFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after concatenation
     */
    translate: function(translationFactor) {
        return this.concatenate(imMatch.AffineTransform.getTranslationInstance(translationFactor));
    },

    /**
     * Pre-concatenates with a translation affine transform <br>
     * [1 0 x] [m00 m01 m02] <br>
     * [0 1 y] [m10 m11 m12] <br>
     * [0 0 1] [  0   0   1]
     * @param {Vector} translationFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preTranslate: function(translationFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getTranslationInstance(translationFactor));
    },

    /**
     * Concatenates with a rotation affine transform which the rotation center is anchorPoint. <br>
     * [m00 m01 m02] [ cos sin (x - x * cos + y * sin)] <br>
     * [m10 m11 m12] [-sin cos (y - x * sin - y * cos)] <br>
     * [  0   0   1] [   0   0                       1]
     * @param {Float} rad unit: radian
     * @param {Object} anchorPoint {x: float, y: float}
     * @returns {AffineTransform} Result Result after concatenation
     */
    rotate: function(rad, anchorPoint) {
        return this.concatenate(imMatch.AffineTransform.getRotateInstance(rad, anchorPoint));
    },

    /**
     * Pre-concatenates with a rotation affine transform which the rotation center is anchorPoint. <br>
     * [ cos sin (x - x * cos + y * sin)] [m00 m01 m02] <br>
     * [-sin cos (y - x * sin - y * cos)] [m10 m11 m12] <br>
     * [   0   0                       1] [  0   0   1]
     * @param {Float} rad unit: radian
     * @param {Object} anchorPoint {x: float, y: float}
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preRotate: function(rad, anchorPoint) {
        return this.preConcatenate(imMatch.AffineTransform.getRotateInstance(rad, anchorPoint));
    },

    /**
     * Concatenates with a shearing affine transform. <br>
     * [m00 m01 m02] [1 x 0] <br>
     * [m10 m11 m12] [y 1 0] <br>
     * [  0   0   1] [0 0 1]
     * @param {Vector} shearFactor {x: float, y: float}
     * @returns {AffineTransform} Result Result after concatenation
     */
    shear: function(shearFactor) {
        return this.concatenate(imMatch.AffineTransform.getShearInstance(shearFactor));
    },

    /**
     * Pre-concatenates with a shearing affine transform. <br>
     * [1 x 0] [m00 m01 m02] <br>
     * [y 1 0] [m10 m11 m12] <br>
     * [0 0 1] [  0   0   1]
     * @param {Vector} shearFactor {x: float, y: float}
     * @returns {AffineTransform} Result Result after pre-concatenation
    */
    preShear: function(shearFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getShearInstance(shearFactor));
    },

    /**
     * Concatenates a affine transform.
     * this * tx
     * @param {AffineTransform} tx
     * @returns {AffineTransform} Result Result after concatenation
     */
    concatenate: function(tx) {
        if (imMatch.isEmpty(tx) ||
            !jQuery.isNumeric(tx.m00) || !jQuery.isNumeric(tx.m01) || !jQuery.isNumeric(tx.m02) ||
            !jQuery.isNumeric(tx.m10) || !jQuery.isNumeric(tx.m11) || !jQuery.isNumeric(tx.m12)) {
            return this;
        }
        var m0 = this.m00, m1 = this.m01;
        this.m00 = tx.m00 * m0 + tx.m10 * m1;
        this.m01 = tx.m01 * m0 + tx.m11 * m1;
        this.m02 += tx.m02 * m0 + tx.m12 * m1;

        m0 = this.m10;
        m1 = this.m11;
        this.m10 = tx.m00 * m0 + tx.m10 * m1;
        this.m11 = tx.m01 * m0 + tx.m11 * m1;
        this.m12 += tx.m02 * m0 + tx.m12 * m1;
        return this;
    },

    /**
     * Pre-concatenates a affine transform.
     * tx * this
     * @param {AffineTransform} tx
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preConcatenate: function(tx) {
        if (imMatch.isEmpty(tx) ||
            !jQuery.isNumeric(tx.m00) || !jQuery.isNumeric(tx.m01) || !jQuery.isNumeric(tx.m02) ||
            !jQuery.isNumeric(tx.m10) || !jQuery.isNumeric(tx.m11) || !jQuery.isNumeric(tx.m12)) {
            return this;
        }

        var m0 = this.m00, m1 = this.m10;
        this.m00 = tx.m00 * m0 + tx.m01 * m1;
        this.m10 = tx.m10 * m0 + tx.m11 * m1;

        m0 = this.m01;
        m1 = this.m11;
        this.m01 = tx.m00 * m0 + tx.m01 * m1;
        this.m11 = tx.m10 * m0 + tx.m11 * m1;

        m0 = this.m02;
        m1 = this.m12;
        this.m02 = tx.m00 * m0 + tx.m01 * m1 + tx.m02;
        this.m12 = tx.m10 * m0 + tx.m11 * m1 + tx.m12;
        return this;
    },

    /**
     * Transforms a vector to another vector through this affine transform.
     *      [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
     *      [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
     *      [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
     * @param {Vector} vec {x: float, y: float}
     * @returns {Vector} Result Transformation result: {x: float, y: float}
     */
    transform: function(vec) {
        if (!imMatch.is2DVector(vec)) {
            return {x: 0, y: 0};
        }

        return {
            x: vec.x * this.m00 + vec.y * this.m01 + this.m02,
            y: vec.x * this.m10 + vec.y * this.m11 + this.m12
        };
    },

    /**
     * Computes determinant
     * @returns {Float} Result determinant
     */
    getDeterminant: function() {
        return this.m00 * this.m11 - this.m01 * this.m10;
    },

    /**
     * Invertible or not
     * @returns {Boolean} Result True if the affine transform is invertible; otherwise, false
     */
    isInvertible: function() {
        var det = this.getDeterminant();
        return (jQuery.isNumeric(det) && jQuery.isNumeric(this.m02) &&
            jQuery.isNumeric(this.m12) && det !== 0);
    },

    /**
     * Computes the inversion affine transform. The result is stored by itself.
     * @returns {AffineTransform} Result Inversion affine transform
     */
    inverse: function() {
        if (!this.isInvertible) {
            return this;
        }

        var det = this.getDeterminant(),
            m00 = this.m00, m10 = this.m10, m01 = this.m01,
            m11 = this.m11, m02 = this.m02, m12 = this.m12;

        this.m00 = m11 / det;
        this.m10 = -m10 / det;
        this.m01 = -m01 / det;
        this.m11 = m00 / det;
        this.m02 = (m01 * m12 - m11 * m02) / det;
        this.m12 = (m10 * m02 - m00 * m12) / det;

        return this;
    },

    /**
     * Computes the inversion affine transform. Do not modify inself.
     * @returns {AffineTransform} Result Inversion affine transform
     */
    createInverse: function() {
        if (!this.isInvertible) {
            return this;
        }

        return this.clone().inverse();
    },

    /**
     * Setter to a scaling affine transform.
     * @param {Vector} scalingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Ascaling affine transform
     */
    setToScale: function(scalingFactor) {
        if (jQuery.isEmptyObject(scalingFactor)) {
            scalingFactor = {x: 1, y: 1};
        }
        return this.setTransform(scalingFactor.x, 0, 0, scalingFactor.y, 0, 0);
    },

    /**
     * Setter to a translation affine transform.
     * @param {Vector} translationFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result A translation affine transform
     */
    setToTranslation: function(translationFactor) {
        if (jQuery.isEmptyObject(translationFactor)) {
            translationFactor = {x: 0, y: 0};
        }
        return this.setTransform(1, 0, 0, 1, translationFactor.x, translationFactor.y);
    },

    /**
     * Setter to a shearing affine transform.
     * @param {Vector} shearingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result A shearing affine transform
     */
    setToShear: function(shearFactor) {
        if (jQuery.isEmptyObject(shearFactor)) {
            shearFactor = {x: 0, y: 0};
        }
        return this.setTransform(1, shearFactor.y, shearFactor.x, 1, 0, 0);
    },

    /**
     * Setter to a rotation affine transform.
     * @param {Float} rad unit: radian
     * @param {Vector} anchorPoint {x: float, y: float}
     * @returns {AffineTransform} Result A rotation affine transform
     */
    setToRotation: function(rad, anchorPoint) {
        if (jQuery.isEmptyObject(anchorPoint)) {
            anchorPoint = {x: 0, y: 0};
        }
        rad = (jQuery.isNumeric(rad))? rad : 0;

        var cos = Math.cos(rad), sin = Math.sin(rad);
        return this.setTransform(cos, sin, -sin, cos,
            anchorPoint.x - anchorPoint.x * cos + anchorPoint.y * sin,
            anchorPoint.y - anchorPoint.x * sin - anchorPoint.y * cos);

    },

    /**
     * Serializes as a json.
     * @returns {Array} Result [m00, m10, m01, m11, m02, m12]
     */
    toJSON: function() {
        return [this.m00, this.m10, this.m01, this.m11, this.m02, this.m12];
    },

    /**
     * Prints the affine transform.
     */
    print: function() {
        window.console.log("[ " + this.m00 + " " + this.m01 + " " + this.m02 + " ]");
        window.console.log("[ " + this.m10 + " " + this.m11 + " " + this.m12 + " ]");
        window.console.log("[ 0 0 1 ]");
        window.console.log();
    }
};