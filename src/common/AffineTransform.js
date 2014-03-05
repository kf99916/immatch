/*
 *      [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
 *      [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
 *      [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
 *
 * Reference: http://code.google.com/p/closure-library/source/browse/closure/goog/math/affinetransform.js
*/
imMatch.AffineTransform = function(m00, m10, m01, m11, m02, m12) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.AffineTransform) ) {
        return new imMatch.AffineTransform(m00, m10, m01, m11, m02, m12);
    }

    this.setTransform(m00, m10, m01, m11, m02, m12);
};

imMatch.AffineTransform.getScaleInstance = function(scalingFactor) {
    return new imMatch.AffineTransform().setToScale(scalingFactor);
};

imMatch.AffineTransform.getTranslationInstance = function(translationFactor) {
    return new imMatch.AffineTransform().setToTranslation(translationFactor);
};

imMatch.AffineTransform.getShearInstance = function(shearFactor) {
    return new imMatch.AffineTransform().setToShear(shearFactor);
};

imMatch.AffineTransform.getRotateInstance = function(rad, anchorPoint) {
    return new imMatch.AffineTransform().setToRotation(rad, anchorPoint);
};

imMatch.AffineTransform.prototype = {
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

    clone: function() {
        return new imMatch.AffineTransform(this.m00, this.m10, this.m01, this.m11, this.m02, this.m12);
    },

    /*
     * [m00 m01 m02] [x 0 0]
     * [m10 m11 m12] [0 y 0]
     * [  0   0   1] [0 0 1]
    */
    scale: function(scalingFactor) {
        return this.concatenate(imMatch.AffineTransform.getScaleInstance(scalingFactor));
    },

    /*
     * [x 0 0] [m00 m01 m02]
     * [0 y 0] [m10 m11 m12]
     * [0 0 1] [  0   0   1]
    */
    preScale: function(scalingFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getScaleInstance(scalingFactor));
    },

    /*
     * [m00 m01 m02] [1 0 x]
     * [m10 m11 m12] [0 1 y]
     * [  0   0   1] [0 0 1]
    */
    translate: function(translationFactor) {
        return this.concatenate(imMatch.AffineTransform.getTranslationInstance(translationFactor));
    },

    /*
     * [1 0 x] [m00 m01 m02]
     * [0 1 y] [m10 m11 m12]
     * [0 0 1] [  0   0   1]
    */
    preTranslate: function(translationFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getTranslationInstance(translationFactor));
    },

    /*
     * [m00 m01 m02] [ cos sin (x - x * cos + y * sin)]
     * [m10 m11 m12] [-sin cos (y - x * sin - y * cos)]
     * [  0   0   1] [   0   0                       1]
    */
    rotate: function(rad, anchorPoint) {
        return this.concatenate(imMatch.AffineTransform.getRotateInstance(rad, anchorPoint));
    },

    /*
     * [ cos sin (x - x * cos + y * sin)] [m00 m01 m02]
     * [-sin cos (y - x * sin - y * cos)] [m10 m11 m12]
     * [   0   0                       1] [  0   0   1]
    */
    preRotate: function(rad, anchorPoint) {
        return this.preConcatenate(imMatch.AffineTransform.getRotateInstance(rad, anchorPoint));
    },

    /*
     * [m00 m01 m02] [1 x 0]
     * [m10 m11 m12] [y 1 0]
     * [  0   0   1] [0 0 1]
    */
    shear: function(shearFactor) {
        return this.concatenate(imMatch.AffineTransform.getShearInstance(shearFactor));
    },

    /*
     * [1 x 0] [m00 m01 m02]
     * [y 1 0] [m10 m11 m12]
     * [0 0 1] [  0   0   1]
    */
    preShear: function(shearFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getShearInstance(shearFactor));
    },

    // this * tx
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

    // tx * this
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

    /*
     *      [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
     *      [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
     *      [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
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

    getDeterminant: function() {
        return this.m00 * this.m11 - this.m01 * this.m10;
    },

    isInvertible: function() {
        var det = this.getDeterminant();
        return jQuery.isNumeric(det) && jQuery.isNumeric(this.m02) &&
            jQuery.isNumeric(this.m12_) && det != 0;
    },

    createInverse: function() {
        if (!this.isInvertible) {
            return this;
        }

        var det = this.getDeterminant();
        return new imMatch.AffineTransform(this.m11 / det, -this.m10 / det, -this.m01 / det,
                this.m00 / det, (this.m01 * this.m12 - this.m11 * this.m02) / det,
                (this.m10 * this.m02- this.m00 * this.m12) / det);
    },

    setToScale: function(scalingFactor) {
        if (jQuery.isEmptyObject(scalingFactor)) {
            scalingFactor = {x: 1, y: 1};
        }
        return this.setTransform(scalingFactor.x, 0, 0, scalingFactor.y, 0, 0);
    },

    setToTranslation: function(translationFactor) {
        if (jQuery.isEmptyObject(translationFactor)) {
            translationFactor = {x: 0, y: 0};
        }
        return this.setTransform(1, 0, 0, 1, translationFactor.x, translationFactor.y);
    },

    setToShear: function(shearFactor) {
        if (jQuery.isEmptyObject(shearFactor)) {
            shearFactor = {x: 0, y: 0};
        }
        return this.setTransform(1, shearFactor.y, shearFactor.x, 1, 0, 0);
    },

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

    getScalingFactor: function() {
        return {x: this.m00, y: this.m11};
    },

    setScalingFactor: function(scalingFactor) {
        if (jQuery.isEmptyObject(scalingFactor)) {
            return this;
        }

        this.m00 = scalingFactor.x;
        this.m11 = scalingFactor.y;

        return this;
    },

    print: function() {
        console.log("[ " + this.m00 + " " + this.m01 + " " + this.m02 + " ]");
        console.log("[ " + this.m10 + " " + this.m11 + " " + this.m12 + " ]");
        console.log("[ 0 0 1 ]");
        console.log();
    }
};