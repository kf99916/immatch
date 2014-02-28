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
    this.canvas.style.width = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.height + "px";

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
            this.canvas.width *= ratio;
            this.canvas.heifht *= ratio;
            this.context.scale(ratio, ratio);
        }

        return this;
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        return this;
    },

    draw: function(stamp) {
        jQuery.each(imMatch.scenes.reverse(), function(i, scene) {
            var affineTransformFromScene2Local = 
                imMatch.viewport.affineTransform.createInverse().concatenate(scene.affineTransform.createInverse);

            jQuery.each(scene.sprites.reverse(), function(i, sprite) {
                var affineTransformFromSprite2Local = 
                    sprite.affineTransform.createInverse().preConcatenate(affineTransformFromScene2Local);

                this.context.save();

                this.context.setTransform(
                    affineTransformFromSprite2Local.m00, affineTransformFromSprite2Local.m10, affineTransformFromSprite2Local.m01,
                    affineTransformFromSprite2Local.m11, affineTransformFromSprite2Local.m02, affineTransformFromSprite2Local.m12);

                this.context.globalAlpha *= alpha;

                this.context.drawImage(sprite.image, 0, 0, sprite.width * sprite.image.ppi, sprite.height * sprite.image.ppi);

                this.context.restore();
            });
        });
    }
};