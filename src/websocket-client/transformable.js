imMatch.transformable = {
    // ===================== The following functions must be overriding =====================
    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        result = this.transform(target);
        return jQuery.extend(target, result);
    },

    getAffineTransform2Local: function() {
        return this.affineTransform;
    },

    serialize: function() {
        return {
            affineTransform: [this.affineTransform.m00, this.affineTransform.m10, this.affineTransform.m01,
                                this.affineTransform.m11, this.affineTransform.m02, this.affineTransform.m12]
        };
    },

    deserialize: function(data) {
        if (jQuery.isArray(data.affineTransform) && data.affineTransform.length === 6) {
            this.affineTransform = imMatch.AffineTransform.apply(this, data.affineTransform);
            delete data.affineTransform;
        }

        return jQuery.extend(true, this, data);
    },

    // ===================== The above functions must be overriding =====================

    getBoundingBox: function() {
        var affineTransform2Local = this.getAffineTransform2Local(),
            diff = {x: this.width / 2, y: this.height / 2},
            c1 = affineTransform2Local.transform({x: -diff.x, y: -diff.y}),
            c2 = affineTransform2Local.transform({x: diff.x, y: -diff.y}),
            c3 = affineTransform2Local.transform({x: diff.x, y: diff.y}),
            c4 = affineTransform2Local.transform({x: -diff.x, y: diff.y}),
            bx1 = Math.min(c1.x, c2.x, c3.x, c4.x),
            by1 = Math.min(c1.y, c2.y, c3.y, c4.y),
            bx2 = Math.max(c1.x, c2.x, c3.x, c4.x),
            by2 = Math.max(c1.y, c2.y, c3.y, c4.y),
            ori = affineTransform2Local.transform({x: 0, y: 0});

        return {
            x: ori.x, y: ori.y,
            width: bx2 - bx1, height: by2 - by1
        };
    },

    transform: function(vec) {
        return this.affineTransform.transform(vec);
    },

    inverseTransform: function(vec) {
        return this.affineTransform.createInverse().transform(vec);
    },

    translate: function(translationFactor) {
        return this.affineTransform.preTranslate(translationFactor);
    },

    rotate: function(rad, anchorPoint) {
        return this.affineTransform.preRotate(rad, anchorPoint);
    },

    scale: function(scalingFactor) {
        return this.affineTransform.preScale(scalingFactor);
    },

    shear: function(shearFactor) {
        return this.affineTransform.preShear(shearFactor);
    }
};