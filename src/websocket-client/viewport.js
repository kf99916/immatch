imMatch.Viewport = function(affineTransform) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Viewport) ) {
        return new imMatch.Viewport();
    }

    this.id = Math.uuidFast();

    this.width = window.innerWidth / imMatch.device.ppi;
    this.height = window.innerHeight / imMatch.device.ppi;

    //  Global Coordinate: The origin is initialized as the center of imMatch.viewport
    this.affineTransform = affineTransform || imMatch.AffineTransform.getTranslationInstance({
        x: (this.width / 2), y: (this.height / 2)});
};

jQuery.extend(imMatch.Viewport.prototype, imMatch.transformable, {
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

    serialize: function() {
        return {
            id: this.id,
            width: this.width,
            height: this.height,
            affineTransform: [this.affineTransform.m00, this.affineTransform.m10, this.affineTransform.m01,
                                this.affineTransform.m11, this.affineTransform.m02, this.affineTransform.m12]
        };
    },

    transform: function(vec) {
        return this.affineTransform.transform(vec);
    },

    inverseTransform: function(vec) {
        return this.affineTransform.createInverse().transform(vec);
    },

    translate: function(translationFactor) {
        translationFactor.x = -translationFactor.x;
        translationFactor.y = -translationFactor.y;
        return this.affineTransform.preTranslate(translationFactor);
    },

    rotate: function(rad, anchorPoint) {
        rad = -rad;
        return this.affineTransform.preRotate(rad, anchorPoint);
    },

    scale: function(scalingFactor) {
        return this.affineTransform.preScale(scalingFactor);
    },

    shear: function(shearFactor) {
        return this.affineTransform.preShear(shearFactor);
    }
});

imMatch.viewport = new imMatch.Viewport();