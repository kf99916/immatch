var sceneZ = 0;

imMatch.Scene = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene();
    }

    // Global Coordinate
    this.x = imMatch.viewport.x;
    this.y = imMatch.viewport.y;
    this.z = sceneZ++;
    this.width = imMatch.viewport.width;
    this.height = imMatch.viewport.height;
    this.rad = imMatch.viewport.rad;
    this.viewports = [imMatch.viewport];
    
    imMatch.on("contextWillbeDrawn", this.contextWillbeDrawnHandler);
};

imMatch.Scene.prototype = {
    contextWillbeDrawnHandler: function(event) {
        imMatch.logInfo("[imMatch.Scene.contextWillbeDrawnHandler]");
    }
};

imMatch.scenes = [];