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
                            "margin-top: " + -this.canvas.height / 2 + "px; ");

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

    draw: function() {
        var self = this;

        // Optimization 1:Just clear the rerender region
        // TODO
        this.clear();

        this.drawTransformableObject(imMatch.viewport);

        jQuery.each(imMatch.scenes.reverse(), function(i, scene) {
            self.drawTransformableObject(scene, {lineWidth: 2, color: "red", alpha: 1});
            jQuery.each(scene.sprites.reverse(), function(i, sprite) {
                // Optimization 2: Skip those sprites which is not in the viewport
                if (!sprite.isInViewport()) {
                    return;
                }

                self.drawTransformableObject(sprite);
            });
        });
    },

    drawTransformableObject: function(transformableObject, style) {
        if (jQuery.isEmptyObject(transformableObject)) {
            return this;
        }

        var affineTransformForDraw = transformableObject.computeAffineTransformForDraw(),
            frame = transformableObject.frame;

        // Optimization 3: Avoid floating point coordinates to improve performance, so invoke imMatch.round
        frame = {
            x: -imMatch.round(frame.x / 2),
            y: -imMatch.round(frame.y / 2),
            width: imMatch.round(frame.x),
            height: imMatch.round(frame.y)
        };

        style = style || {lineWidth: 5, color: "black", alpha: 1};

        this.context.save();

        this.context.transform(
            affineTransformForDraw.m00, affineTransformForDraw.m10,
            affineTransformForDraw.m01, affineTransformForDraw.m11,
            affineTransformForDraw.m02 * imMatch.device.ppi,
            affineTransformForDraw.m12 * imMatch.device.ppi);

        if (jQuery.isEmptyObject(transformableObject.image)) {
            this.context.globalAlpha *= style.alpha;
            this.context.beginPath();
            this.context.lineWidth = style.lineWidth;
            this.context.strokeStyle = style.color;

            this.context.rect(frame.x, frame.y, frame.width, frame.height);
            this.context.stroke();
            this.context.closePath();
        }
        else {
            this.context.globalAlpha *= transformableObject.alpha;

            if (imMatch.engine.isShowDebugInfo()) {
                var center = transformableObject.computePosition();
                this.context.fillText(transformableObject.id + ": ( " + center.x + ", " + center.y + " )", frame.x, frame.y);
            }

            this.context.drawImage(transformableObject.image, frame.x, frame.y, frame.width, frame.height);
        }

        this.context.restore();
    }
};