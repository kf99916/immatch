imMatch.transformable = {};

imMatch.transformable.members = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rad: 0,
    scalingFactor: 1,
    shearFactor: {x: 0, y: 0},
    maxScalingFactor: Number.MAX_VALUE,
    minScalingFactor: Number.MIN_VALUE,
    touchable: false,
    movable: false,
    rotatable: false,
    scalable: false,
    shearable: false
};

imMatch.transformable.prototype = {
    deserialize: function(data) {
        if (jQuery.isArray(data.affineTransform) && data.affineTransform.length === 6) {
            this.affineTransform = imMatch.AffineTransform.apply(this, data.affineTransform);
            delete data.affineTransform;
        }

        return jQuery.extend(true, this, data);
    },

    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        result = this.transform(target);
        return jQuery.extend(target, result);
    },

    getAppliedTransform: function() {
        var center = {x: this.x, y: this.y};
       return imMatch.AffineTransform.getRotateInstance(this.rad).
                preScale(this.scalingFactor).preShear(this.shearFactor).preTranslate(center);
    },

    getAffineTransform2Local: function() {
        return this.getAppliedTransform();
    },

    getAffineTransformForDraw: function() {
        return this.getAffineTransform2Local();
    },

    getFrame: function() {
        return imMatch.AffineTransform.getScaleInstance({
                        x: imMatch.device.ppi,
                        y: imMatch.device.ppi}).
                        transform({x: this.width, y: this.height});
    },

    getBoundingBox: function() {
        var affineTransformForDraw = this.getAffineTransformForDraw(),
            diff = {x: this.width / 2, y: this.height / 2},
            c1 = affineTransformForDraw.transform({x: -diff.x, y: -diff.y}),
            c2 = affineTransformForDraw.transform({x: diff.x, y: -diff.y}),
            c3 = affineTransformForDraw.transform({x: diff.x, y: diff.y}),
            c4 = affineTransformForDraw.transform({x: -diff.x, y: diff.y}),
            bx1 = Math.min(c1.x, c2.x, c3.x, c4.x),
            by1 = Math.min(c1.y, c2.y, c3.y, c4.y),
            bx2 = Math.max(c1.x, c2.x, c3.x, c4.x),
            by2 = Math.max(c1.y, c2.y, c3.y, c4.y),
            ori = affineTransformForDraw.transform({x: 0, y: 0});

        return {
            x: ori.x, y: ori.y,
            width: bx2 - bx1, height: by2 - by1
        };
    },

    transform: function(vec) {
        return this.getAppliedTransform().transform(vec);
    },

    inverseTransform: function(vec) {
        return this.getAppliedTransform().createInverse().transform(vec);
    },

    translate: function(translationFactor) {
        if (!this.movable) {
            return this;
        }

        this.x += translationFactor.x || 0;
        this.y += translationFactor.y || 0;

        if (!jQuery.isEmptyObject(this.affineTransform)) {
            this.affineTransform.preTranslate(translationFactor);
        }

        return this;
    },

    rotate: function(rad, anchorPoint) {
        if (!this.rotatable) {
            return this;
        }

        this.rad += rad || 0;

        if (!jQuery.isEmptyObject(this.affineTransform)) {
            this.affineTransform.preRotate(rad, anchorPoint);
        }

        return this;
    },

    scale: function(scalingFactor) {
        if (!this.scalable) {
            return this;
        }

        scalingFactor = scalingFactor || 1;

        var newScalingFactor = this.scalingFactor * scalingFactor;
        if (newScalingFactor < this.minScalingFactor) {
            scalingFactor = this.minScalingFactor / this.scalingFactor;
        }
        else if (newScalingFactor > this.maxScalingFactor) {
            scalingFactor = this.maxScalingFactor / this.scalingFactor;
        }

        this.scalingFactor *= scalingFactor;

        if (!jQuery.isEmptyObject(this.affineTransform)) {
            this.affineTransform.preScale({x: scalingFactor, y: scalingFactor});
        }

        return this;
    },

    shear: function(shearFactor) {
        if (!this.shearable) {
            return;
        }

        this.shearFactor.x += shearFactor.x || 0;
        this.shearFactor.y += shearFactor.y || 0;

        if (!jQuery.isEmptyObject(this.affineTransform)) {
            this.affineTransform.preShear(shearFactor);
        }
    }
};