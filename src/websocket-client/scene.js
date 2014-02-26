imMatch.Scene = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene();
    }

    imMatch.event.add(this, "contextWillbeDrawn", this.contextWillbeDrawnHandler);
};

imMatch.Scene.prototype = {
    contextWillbeDrawnHandler: function(event) {
        
    }
};