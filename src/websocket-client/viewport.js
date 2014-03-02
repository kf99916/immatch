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
    transformWithCoordinate: function(vec) {
        switch(vec.coordinate) {
            // Local -> Global
            case imMatch.coordinate.local:
                vec.coordinate = imMatch.coordinate.global; 
                return this.inverseTransform(vec);
            break;
            // Global -> Local
            case imMatch.coordinate.global:
                vec.coordinate = imMatch.coordinate.local;
                return this.transform(vec);
            break;
            default:
            break;
        }
    }
});