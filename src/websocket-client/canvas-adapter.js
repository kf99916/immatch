imMatch.CanvasAdapter = function CanvasAdapter(canvasID) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.CanvasAdapter) ) {
        return new imMatch.CanvasAdapter(canvasID);
    }

    canvasID = canvasID || "canvas";
    this.canvas = document.getElementById(canvasID);
    if (jQuery.isEmptyObject(this.canvas)) {
        this.createCanvas(canvasID);
    }

    this.canvas.width = imMatch.viewport.width * imMatch.device.ppi;
    this.canvas.height = imMatch.viewport.height * imMatch.device.ppi;
    this.canvas.setAttribute("style", "width: " + this.canvas.width  + "px; " +
                            "height: " + this.canvas.height + "px; " +
                            "position: absolute; top: 50%; left: 50%; " +
                            "margin-left: " + -this.canvas.width / 2 + "px; " + 
                            "margin-top: " + -this.canvas.height / 2 + "px; " + 
                            "border: 1px solid red;");

    this.ratio = 1;

    this.context = this.canvas.getContext("2d");
    this.adjustCanvasSize();
};

imMatch.CanvasAdapter.prototype = {
    createCanvas: function(canvasID) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = canvasID;
        document.body.appendChild(this.canvas);

        return this;
    },

    // Reference: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
    adjustCanvasSize: function() {
        var backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
                            this.context.mozBackingStorePixelRatio ||
                            this.context.msBackingStorePixelRatio ||
                            this.context.oBackingStorePixelRatio ||
                            this.context.backingStorePixelRatio || 1,
            ratio = imMatch.device.devicePixelRatio / backingStoreRatio;

        this.ratio *= ratio;
        this.canvas.width *= ratio;
        this.canvas.height *= ratio;
        this.context.scale(ratio, ratio);

        return this;
    },

    clear: function() {
        this.context.save();

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.restore();

        return this;
    },

    draw: function(stamp) {
        var self = this;

        this.clear();

        jQuery.each(imMatch.scenes.reverse(), function(i, scene) {
            // Scene -> Global -> Local
            var affineTransformFromScene2Local = imMatch.viewport.affineTransform.clone().concatenate(scene.affineTransform);
            jQuery.each(scene.sprites.reverse(), function(i, sprite) {
                // Sprite -> Scene
                var affineTransformFromSprite2Local = sprite.affineTransform.clone().preConcatenate(affineTransformFromScene2Local),
                    width = sprite.width * sprite.image.ppi, height = sprite.height * sprite.image.ppi;

                self.context.save();

                self.context.setTransform(
                    affineTransformFromSprite2Local.m00, affineTransformFromSprite2Local.m10,
                    affineTransformFromSprite2Local.m01, affineTransformFromSprite2Local.m11,
                    affineTransformFromSprite2Local.m02 * imMatch.device.ppi * self.ratio, 
                    affineTransformFromSprite2Local.m12 * imMatch.device.ppi * self.ratio);

                self.context.globalAlpha *= sprite.alpha;
                self.context.drawImage(sprite.image, -width / 2, - height / 2, width, height);

                self.context.restore();
            });
        });
    }
};