imMatch.viewport = {
    // Global Coordinate: The origin is initialized as the center of imMatch.viewport
    x: 0,

    y: 0,

    width: window.innerWidth / imMatch.device.ppi,

    height: window.innerHeight / imMatch.device.ppi,

    affineTransform: null,

    transformFromLocal2Global: function(vec) {
        return this.affineTransform.transform(vec);
    },

    transformFromGlobal2Local: function(vec) {
        return this.affineTransform.createInverse().transform(vec);
    },
};

imMatch.viewport.affineTransform = imMatch.AffineTransform.getTranslationInstance({
        x: -imMatch.viewport.width / 2, y: -imMatch.viewport.height / 2});