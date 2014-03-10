imMatch.viewport = {
    id: Math.uuidFast(),

    width: window.innerWidth / imMatch.device.ppi,

    height: window.innerHeight / imMatch.device.ppi,

    affineTransform: null
};

//  Global Coordinate: The origin is initialized as the center of imMatch.viewport
imMatch.viewport.affineTransform = imMatch.AffineTransform.getTranslationInstance({
    x: (imMatch.viewport.width / 2), y: (imMatch.viewport.height / 2)});

jQuery.extend(imMatch.viewport, imMatch.transformPrototype, {
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