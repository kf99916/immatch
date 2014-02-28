imMatch.Sprite = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Sprite) ) {
        return new imMatch.Sprite();
    }

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rad = 0;
    this.scale = 1;
    this.alpha = 1;

    this.touchable = true;
    this.movable = true;
    this.rotatable = true;
    this.scalable = true;

    this.maxScale = 1.0;
    this.minScale = 1.0;
}

imMatch.Sprite.prototype = {
    setContainedScene: function(scene) {
        if (jQuery.isEmptyObject(scene)) {
            return this;
        }

        this.scene = scene;
        this.z = scene.z * scene.maxNumSprites + scene.spriteZ;
    },

    isTouched: function(touchMouseEvent) {
        if (!this.touchable) {
            return false;
        }
        
        // TODO
        return true;
    },

    updateTransform: function(touchMouseEvent) {
        
    }
}