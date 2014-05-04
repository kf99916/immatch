imMatch.Viewport = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Viewport) ) {
        return new imMatch.Viewport();
    }

    jQuery.extend(true, this, imMatch.transformable.members);

    this.id = Math.uuidFast();

    this.width = window.innerWidth / imMatch.device.ppi;
    this.height = window.innerHeight / imMatch.device.ppi;

    this.global2LocalTransform = imMatch.AffineTransform.getTranslationInstance({
        x: this.width / 2, y: this.height / 2});

    this.movable = true;
    this.rotatable = true;

    this.frame = imMatch.AffineTransform.getScaleInstance({
                            x: imMatch.device.ppi,
                            y: imMatch.device.ppi}).
                            transform({x: this.width, y: this.height});
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

    computeAffineTransform2Local: function() {
        return this.computeAppliedTransform().inverse().preConcatenate(this.global2LocalTransform);
    },

    computeAffineTransformForDraw: function() {
        return this.global2LocalTransform;
    },

    transform: function(vec) {
        return this.computeAffineTransform2Local().transform(vec);
    },

    inverseTransform: function(vec) {
        return this.computeAffineTransform2Local().inverse().transform(vec);
    },

    deserialize: function(data) {
        if (data.global2LocalTransform.length === 6) {
            this.global2LocalTransform = imMatch.AffineTransform.apply(this, data.global2LocalTransform);
            delete data.global2LocalTransform;
        }

        return jQuery.extend(this, data);
    },
});

imMatch.viewport = new imMatch.Viewport();