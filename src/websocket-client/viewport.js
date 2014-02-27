// Global Coordinate
imMatch.viewport = {
    x: 0,

    y: 0,

    width: window.innerWidth / imMatch.device.ppi,

    height: window.innerHeight / imMatch.device.ppi,

    rad: 0,

    affineTransformation: null,

    transformFromLocal2Global: function(vec) {
        return this.affineTransformation.transform(vec);
    },

    transformFromGlobal2Local: function(vec) {
        return this.affineTransformation.createInverse.transform(vec);
    },
};

imMatch.viewport.affineTransformation = imMatch.AffineTransform.getTranslationInstance({
        x: -imMatch.viewport.width / 2, y: -imMatch.viewport.height / 2});