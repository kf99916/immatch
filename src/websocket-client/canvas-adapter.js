imMatch.CanvasAdapter = function CanvasAdapter(canvasID) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.CanvasAdapter) ) {
        return new imMatch.CanvasAdapter(canvasID);
    }

    canvasID = canvasID || "canvas";
    this.canvas = document.getElementById(canvasID);
    if (jQuery.isEmptyObject(this.canvas)) {
        jQuery.error("[imMatch.CanvasAdapter] CanvasID: " + canvasID + " does not exist.");
        this.createCanvas(canvasID);
    }

    this.canvas.width = imMatch.viewport.width;
    this.canvas.height = imMatch.viewport.height;
    this.context = this.canvas.getContext("2d");
};

imMatch.CanvasAdapter.prototype = {
    createCanvas: function(canvasID) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = canvasID;
        document.body.appendChild(canvas);

        return this;
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        return this;
    },
};

imMatch.canvas = new imMatch.CanvasAdapter();