imMatch.transformPrototype = {
    // Must overwrite it
    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target = {};
        deep = deep || false;
        jQuery.extend(deep, target, vec);
        target = this.transform(target);
        return target;
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

    rotate: function(rad) {
        return this.affineTransform.preRotate(rad);
    },

    scale: function(scalingFactor) {
        return this.affineTransform.preScale(scalingFactor);
    },

    shear: function(shearFactor) {
        return this.affineTransform.preShear(shearFactor);
    }
};