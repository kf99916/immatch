imMatch.Sprite = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Sprite) ) {
        return new imMatch.Sprite();
    }

    this.id = Math.uuidFast();

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

        spritePoint = this.transformWithCoordinate(touchMouseEvent, true);
        if (-this.width / 2 <= spritePoint.x && spritePoint.x <= this.width / 2 &&
            -this.height / 2 <= spritePoint.y && spritePoint.y <= this.height / 2) {
            return true;
        }
    },

    updateTransform: function(touchMouseEvent) {
        if (this.movable) {

        }
    },

    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target = {}, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        switch(target.coordinate) {
            // Local -> Global -> Scene -> Sprite
            case imMatch.coordinate.local:
                target.coordinate = imMatch.coordinate.sprite;
                result = this.inverseTransform(this.scene.inverseTransform(imMatch.viewport.inverseTransform(target)));
            break;
            // Global -> Scene -> Sprite
            case imMatch.coordinate.global:
                target.coordinate = imMatch.coordinate.sprite;
                result = this.inverseTransform(this.scene.inverseTransform(target));
            break;
            // Scene -> Sprite
            case imMatch.coordinate.scene:
                target.coordinate = imMatch.coordinate.sprite;
                result = this.inverseTransform(target);
            break;
            // Sprite -> Scene
            case imMatch.coordinate.sprite: 
                target.coordinate = imMatch.coordinate.scene;
                result = this.transform(target);
            break;
            default:
                imMatch.logError("[imMatch.scene.transformWithCoordinate] The coordinate is invalid! Coordinate: " + target.coordinate);
            break;
        }

        jQuery.extend(target, result);
        return target;
    }
});