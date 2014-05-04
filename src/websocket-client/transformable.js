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
    frame: {x: 0, y: 0},
    touchable: false,
    movable: false,
    rotatable: false,
    scalable: false,
    shearable: false
};

imMatch.transformable.prototype = {
    deserialize: function(data) {
        return jQuery.extend(this, data);
    },

    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        result = this.transform(target);
        return jQuery.extend(target, result);
    },

    computeAppliedTransform: function() {
       return imMatch.AffineTransform.getRotateInstance(this.rad).
                preScale({x: this.scalingFactor, y: this.scalingFactor}).preShear(this.shearFactor).preTranslate(this);
    },

    computeAffineTransform2Local: function() {
        return this.computeAppliedTransform();
    },

    computeAffineTransformForDraw: function() {
        return this.computeAffineTransform2Local();
    },

    getBoundingBox: function() {
        var affineTransformForDraw = this.computeAffineTransformForDraw(),
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
        return this.computeAppliedTransform().transform(vec);
    },

    inverseTransform: function(vec) {
        return this.computeAppliedTransform().inverse().transform(vec);
    },

    computePosition: function() {
        return this.computeAppliedTransform().transform({x: 0, y: 0});
    },

    translate: function(translationFactor) {
        if (!this.movable) {
            return this;
        }

        this.x += translationFactor.x || 0;
        this.y += translationFactor.y || 0;

        return this;
    },

    rotate: function(rad, anchorPoint) {
        if (!this.rotatable) {
            return this;
        }

        anchorPoint = anchorPoint || {
            x: 0, y: 0
        };

        var rotationTransform = imMatch.AffineTransform.getRotateInstance(rad, this),
            rotationAnchorPoint = rotationTransform.transform(anchorPoint);

        this.translate({x: anchorPoint.x - rotationAnchorPoint.x,
                        y: anchorPoint.y - rotationAnchorPoint.y});
        this.rad += rad;

        return this;
    },

    scale: function(scalingFactor, anchorPoint) {
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

        this.translate({x: (anchorPoint.x - this.x) * (1 - scalingFactor),
                        y: (anchorPoint.y - this.y) * (1 - scalingFactor)});
        this.scalingFactor *= scalingFactor;

        return this;
    },

    shear: function(shearFactor) {
        if (!this.shearable) {
            return;
        }

        this.shearFactor.x += shearFactor.x || 0;
        this.shearFactor.y += shearFactor.y || 0;
    }
};