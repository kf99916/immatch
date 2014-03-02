imMatch.transformPrototype = {
    // Must overwrite it
    transformWithCoordinate: function(vec) {
        return this.transform(vec);
    },

    transform: function(vec) {
        return this.affineTransform.transform(vec);
    },

    inverseTransform: function(vec) {
        return this.affineTransform.createInverse().transform(vec);
    },

    translate: function(translationFactor) {
        console.log("")
        console.log(this);
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