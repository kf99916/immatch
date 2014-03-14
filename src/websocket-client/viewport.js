imMatch.Viewport = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Viewport) ) {
        return new imMatch.Viewport();
    }

    this.id = Math.uuidFast();

    this.width = window.innerWidth / imMatch.device.ppi;
    this.height = window.innerHeight / imMatch.device.ppi;

    this.translationFactor = {x: 0, y: 0};
    this.rad = 0;

    this.affineTransform = imMatch.AffineTransform.getTranslationInstance({
        x: this.width / 2, y: this.height / 2});
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

    getAppliedTransform: function() {
        return imMatch.AffineTransform.getTranslationInstance(this.translationFactor).preRotate(this.rad);
    },

    serialize: function() {
        return {
            id: this.id,
            width: this.width,
            height: this.height,
            translationFactor: this.translationFactor,
            rad: this.rad,
            affineTransform: [this.affineTransform.m00, this.affineTransform.m10, this.affineTransform.m01,
                                this.affineTransform.m11, this.affineTransform.m02, this.affineTransform.m12]
        };
    },

    transform: function(vec) {
        var affineTransform = this.getAppliedTransform().createInverse().concatenate(this.affineTransform);
        return affineTransform.transform(vec);
    },

    inverseTransform: function(vec) {
        var affineTransform = this.affineTransform.createInverse().preConcatenate(this.getAppliedTransform());
        return affineTransform.transform(vec);
    },

    translate: function(translationFactor) {
        this.translationFactor.x += translationFactor.x;
        this.translationFactor.y += translationFactor.y;
        return this;
    },

    rotate: function(rad) {
        this.rad += rad;
        return this;
    },

    scale: function() {
        return this;
    },

    shear: function() {
        return this;
    }
});

imMatch.viewport = new imMatch.Viewport();