imMatch.Sprite = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Sprite) ) {
        return new imMatch.Sprite();
    }

    this.z = 0;
    this.width = this.height = 0;
    this.alpha = 1;
    this.maxScale = 1.0;
    this.minScale = 1.0;

    this.touchMouseEvents = {};
    this.affineTransform = new imMatch.AffineTransform;

    this.image = null;

    this.touchable = true;
    this.movable = true;
    this.rotatable = true;
    this.scalable = true;
};

jQuery.extend(imMatch.Sprite.prototype, imMatch.transformPrototype, {
    setContainedScene: function(scene) {
        if (jQuery.isEmptyObject(scene)) {
            return this;
        }

        this.scene = scene;
        this.z = scene.z * scene.maxNumSprites + scene.spriteZ;
    },

    setImage: function(id) {
        if (imMatch.isEmpty(id)) {
            return this;
        }

        this.image = imMatch.loader.images[id];
        this.width = this.image.width / this.image.ppi;
        this.height = this.image.height / this.image.ppi;

        return this;
    },

    isTouched: function(touchMouseEvent) {
        var spritePoint;
        if (!this.touchable) {
            return false;
        }

        if (!imMatch.is2DVector(touchMouseEvent)) {
            return false;
        }

        spritePoint = this.transformWithCoordinate(touchMouseEvent);

        if (-this.width / 2 <= spritePoint.x && spritePoint.x <= this.width / 2 &&
            -this.height / 2 <= spritePoint.y && spritePoint.y <= this.height / 2) {
            return true;
        }
    },

    updateTransform: function(touchMouseEvent) {
        if (this.movable) {

        }
    },

    transformWithCoordinate: function(vec) {
        switch(vec.coordinate) {
            // Scene -> Sprite
            case imMatch.coordinate.scene:
                vec.coordinate = imMatch.coordinate.sprite; 
                return this.inverseTransform(vec);
            break;
            // Sprite -> Scene
            case imMatch.coordinate.sprite:
                vec.coordinate = imMatch.coordinate.scene;
                return this.transform(vec);
            break;
            default:
            break;
        }
    }
});