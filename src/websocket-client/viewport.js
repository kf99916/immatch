imMatch.Viewport = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Viewport) ) {
        return new imMatch.Viewport();
    }

    jQuery.extend(this, imMatch.transformable.members);

    this.id = Math.uuidFast();

    this.width = window.innerWidth / imMatch.device.ppi;
    this.height = window.innerHeight / imMatch.device.ppi;

    this.global2LocalTransform = imMatch.AffineTransform.getTranslationInstance({
        x: this.width / 2, y: this.height / 2});

    this.movable = true;
    this.rotatable = true;
};

jQuery.extend(imMatch.Viewport.prototype, imMatch.transformable.prototype, {
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

    getAffineTransform2Local: function() {
        return this.getAppliedTransform().createInverse().concatenate(this.global2LocalTransform);
    },

    getAffineTransformForDraw: function() {
        return this.global2LocalTransform;
    },

    transform: function(vec) {
        return this.getAffineTransform2Local().transform(vec);
    },

    inverseTransform: function(vec) {
        return this.getAffineTransform2Local().createInverse().transform(vec);
    },

    deserialize: function(data) {
        if (jQuery.isArray(data.affineTransform) && data.global2LocalTransform.length === 6) {
            this.global2LocalTransform = imMatch.AffineTransform.apply(this, data.global2LocalTransform);
            delete data.global2LocalTransform;
        }

        return jQuery.extend(true, this, data);
    },
});

imMatch.viewport = new imMatch.Viewport();