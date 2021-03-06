/**
 * Creates a Sprite object.
 * @class
 * @classdesc Sprite is a transformable object and it is a basic element in imMatch SDK.
 * @see imMatch.transformable
 * @constructor
 */
imMatch.Sprite = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Sprite) ) {
        return new imMatch.Sprite();
    }

    jQuery.extend(true, this, imMatch.transformable.members);

    this.id = Math.uuidFast();

    this.z = 0;
    this.alpha = 1;

    this.cursorGroup = new imMatch.CursorGroup();
    this.maxNumCursors = 2;

    this.scene = null;
    this.image = null;

    this.touchable = true;
    this.movable = true;
    this.rotatable = true;
    this.scalable = true;
    this.tweenable = true;
};

jQuery.extend(imMatch.Sprite.prototype, imMatch.transformable.prototype, {
    /**
     * Transforms a given vector with its coordinate to the sprite coordinate.
     * @param {Object} vec The given vector
     * @param {Boolean} deep Indicates whether the given vector can be overwritten by the rsult
     * @returns {Object} Result Result
     * @memberof! imMatch.Sprite#
     */
    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target = {}, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        switch(target.coordinate) {
            // Local -> Global -> Scene -> Sprite
            case imMatch.coordinate.local:
                target.coordinate = imMatch.coordinate.sprite;
                result = imMatch.viewport.inverseTransform(this.scene.inverseTransform(this.inverseTransform(target)));
            break;
            // Global -> Scene -> Sprite
            case imMatch.coordinate.global:
                target.coordinate = imMatch.coordinate.sprite;
                result = this.scene.inverseTransform(this.inverseTransform(target));
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

        return jQuery.extend(target, result);
    },

    /**
     * Computes a affine transform to the local coordinate.
     * @returns {AffineTransform} Result A affine transform can transform the vector in the sprite coordinate to the local coordinate
     * @memberof! imMatch.Sprite#
     */
    computeAffineTransform2Local: function() {
        return this.computeAppliedTransform().
                    preConcatenate(this.scene.computeAffineTransform2Local());
    },

    /**
     * Tweens a sprite.
     * @param {Float} duration Performed duration
     * @param {Object} vars The interpolated variables
     * @param {String} ease The ease method. The default value is "Power1.easeOut" (Optional).
     * {@link http://www.greensock.com/get-started-js/#easing|Reference}
     * @memberof! imMatch.Sprite#
     */
    tween: function(duration, vars, /* Optional */ ease) {
        if (!this.tweenable || !jQuery.isPlainObject(vars)) {
            return this;
        }

        duration = duration || 0;
        vars.ease = ease || "Power1.easeOut";
        vars.onStart = this.tweenStart;
        vars.onComplete = this.tweenComplete;

        TweenLite.to(this, duration, vars);

        return this;
    },

    /**
     * Callback function when tween is on start.
     * @memberof! imMatch.Sprite#
     */
    tweenStart: function() {
        this.touchable = false;
        imMatch.engine.tweened = returnTrue;

        return this;
    },

    /**
     * Callback function when tween is completed.
     * @memberof! imMatch.Sprite#
     */
    tweenComplete: function() {
        this.touchable = true;
        imMatch.engine.tweened = returnFalse;

        return this;
    },

    /**
     * Serializes all of the members, except for scene, image, and cursorGroup, as a json.
     * @returns {Object} Result A serialized sprite.
     * @memberof! imMatch.Sprite#
     */
    toJSON: function() {
        var serializedSprite = jQuery.extend(true, serializedSprite, this);
        serializedSprite.sceneID = serializedSprite.scene.id;
        serializedSprite.imageID = serializedSprite.image.id;
        delete serializedSprite.scene;
        delete serializedSprite.image;
        delete serializedSprite.cursorGroup;

        return serializedSprite;
    },

    /**
     * Deserializes data to a Sprite object
     * @param {Object} data Serialized data
     * @returns {Object} Result A Sprite object which including the serialized data
     * @memberof! imMatch.Sprite#
     */
    deserialize: function(data) {
        if (!jQuery.isEmptyObject(data.imageID)) {
            this.setImage(data.imageID);
            delete data.imageID;
        }

        delete data.sceneID;

        return jQuery.extend(this, data);
    },

    /**
     * Set a scene which contained the sprite.
     * @param {Scene} scene A scene
     * @returns {Int} defaultSpriteZ The default z-order for the sprite
     * @memberof! imMatch.Sprite#
     */
    setContainedScene: function(scene, defaultSpriteZ) {
        if (jQuery.isEmptyObject(scene)) {
            return this;
        }

        defaultSpriteZ = defaultSpriteZ || scene.z * scene.maxNumSprites + scene.spriteZ;

        this.scene = scene;
        this.z = defaultSpriteZ;

        return this;
    },

    /**
     * Sets a image with the image ID.
     * @param {String} id The image ID from "load-list.json".
     * @memberof! imMatch.Sprite#
     */
    setImage: function(id) {
        if (imMatch.isEmpty(id)) {
            return this;
        }

        this.image = imMatch.loader.images[id];
        this.width = this.image.width / this.image.ppi;
        this.height = this.image.height / this.image.ppi;

        this.frame = {x: this.image.width, y: this.image.height};
        return this;
    },

    /**
     * Determines whether the sprite is in the current viewport or not.
     * @returns {Boolean} Result True if the sprite is in the current viewport; otherwise, false
     * @memberof! imMatch.Sprite#
     */
    isInViewport: function() {
        var viewportBoundingBox = imMatch.viewport.getBoundingBox(),
            selfBoundingBox = this.getBoundingBox(),
            diff = {
                x: Math.abs(viewportBoundingBox.x - selfBoundingBox.x),
                y: Math.abs(viewportBoundingBox.y - selfBoundingBox.y)
            };

        if (diff.x < (viewportBoundingBox.width + selfBoundingBox.width) / 2 &&
            diff.y < (viewportBoundingBox.height + selfBoundingBox.height) / 2) {
            return true;
        }

        return false;
    },

    /**
     * Determines whether the sprite is touched or not.
     * @returns {Boolean} Result True if the sprite is touched; otherwise, false
     * @memberof! imMatch.Sprite#
     */
    isTouched: function(touchMouseEvent) {
        if (!this.touchable) {
            return false;
        }

        if (!imMatch.is2DVector(touchMouseEvent) || imMatch.isEmpty(touchMouseEvent.coordinate) ||
                imMatch.coordinate.sprite !== touchMouseEvent.coordinate) {
            return false;
        }

        var imageDeviceRatio = this.image.ppi / imMatch.device.ppi,
            boundary = {
                width: this.width / 2 * imageDeviceRatio,
                height: this.height / 2 * imageDeviceRatio
            };

        if (-boundary.width <= touchMouseEvent.x && touchMouseEvent.x <= boundary.width &&
            -boundary.height <= touchMouseEvent.y && touchMouseEvent.y <= boundary.height) {
            return true;
        }

        return false;
    },

    /**
     * Updates the affine transform of the sprite.
     * @memberof! imMatch.Sprite#
     */
    updateAffineTransform: function() {
        var center = this.cursorGroup.computeStartEndCenters(),
            vector, rad, distance, scalingFactor;

        this.translate({x: center.end.x - center.start.x, y: center.end.y - center.start.y});

        if (this.cursorGroup.numCursors === 2) {
            vector = this.cursorGroup.computeStartEndVectors();
            rad = imMatch.rad(vector.start, vector.end);
            this.rotate(rad, center.start);

            distance = this.cursorGroup.computeStartEndDistances();
            scalingFactor = (distance.start !== 0)? distance.end / distance.start : 1;

            this.scale(scalingFactor, center.start);
        }

        return this;
    },

    /**
     * Updates the cursor group of the sprite.
     * @memberof! imMatch.Sprite#
     */
    updateCursorGroup: function() {
        var self = this;
        jQuery.each(this.cursorGroup.cursors, function(id, cursor) {
            var lastPoint;
            switch(cursor.type) {
                case imMatch.touchMouseEventType.up: case imMatch.touchMouseEventType.cancel:
                    self.cursorGroup.removeCursor(cursor);
                break;
                case imMatch.touchMouseEventType.down: case imMatch.touchMouseEventType.move:
                    lastPoint = cursor.points[cursor.numPoints-1];
                    self.cursorGroup.cursors[id].points = [lastPoint];
                    cursor.numPoints = 1;
                break;
                default:
                    lastPoint = cursor.points[cursor.numPoints-1];
                    self.cursorGroup.cursors[id].points = [lastPoint];
                    cursor.numPoints = 1;
                break;
            }
        });

        return this;
    },
});