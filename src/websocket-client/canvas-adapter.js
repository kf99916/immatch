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
    this.canvas.style = "width: " + this.canvas.width  + "px; " +
                        "height: " + this.canvas.height + "px; " +
                        "position: absolute; top: 50%; left: 50%; " +
                        "margin-left: " + -this.canvas.width / 2 + "px; " + 
                        "margin-top: " + -this.canvas.height / 2 + "px;";
    this.canvas.style.border = "1px solid red";

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

        if (ratio != 1) {
            this.ratio = ratio;
            this.canvas.width *= ratio;
            this.canvas.height *= ratio;
            this.context.scale(ratio, ratio);
        }

        return this;
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        return this;
    },

    draw: function(stamp) {
        var self = this;
        jQuery.each(imMatch.scenes.reverse(), function(i, scene) {
            var affineTransformFromScene2Local = 
                imMatch.viewport.affineTransform.createInverse().concatenate(scene.affineTransform.createInverse);
            jQuery.each(scene.sprites.reverse(), function(i, sprite) {
                var affineTransformFromSprite2Local = 
                    sprite.affineTransform.createInverse().preConcatenate(affineTransformFromScene2Local),
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