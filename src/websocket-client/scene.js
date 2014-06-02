/**
 * Creates a Scene object.
 * @class
 * @classdesc Scene is a transformable object and owns sprites.
 * @see imMatch.transformable
 * @constructor
 * @param {Boolean} incrementSceneZ Indicates whether sceneZ is incresed.
 */
imMatch.Scene = function(incrementSceneZ) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene(incrementSceneZ);
    }

    jQuery.extend(true, this, imMatch.transformable.members);

    incrementSceneZ = incrementSceneZ || true;

    this.id = Math.uuidFast();

    this.z = sceneZ;
    if (incrementSceneZ) {
        ++sceneZ;
    }

    this.groupID = 0;
    this.viewportID = imMatch.viewport.id;
    this.width = imMatch.viewport.width;
    this.height = imMatch.viewport.height;

    this.sprites = [];
    this.spriteZ = 0;
    this.maxNumSprites = 100;

    this.solid = false;
    this.movable = true;
    this.rotatable = true;

    this.frame = imMatch.AffineTransform.getScaleInstance({
                            x: imMatch.device.ppi,
                            y: imMatch.device.ppi}).
                            transform({x: this.width, y: this.height});
};

jQuery.extend(imMatch.Scene.prototype, imMatch.transformable.prototype, {
    /**
     * Transforms a given vector with its coordinate.
     * @param {Object} vec The given vector
     * @param {Boolean} deep Indicates whether the given vector can be overwritten by the rsult
     * @returns {Object} Result Result
     * @memberof! imMatch.Scene#
     */
    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target = {}, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        switch(target.coordinate) {
            // Local -> Global -> Scene
            case imMatch.coordinate.local:
                target.coordinate = imMatch.coordinate.scene;
                result = imMatch.viewport.inverseTransform(this.inverseTransform(target));
            break;
            // Global -> Scene
            case imMatch.coordinate.global:
                target.coordinate = imMatch.coordinate.scene;
                result = this.inverseTransform(target);
            break;
            // Scene -> Global
            case imMatch.coordinate.scene:
                target.coordinate = imMatch.coordinate.global;
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
     * @returns {Object} Result A affine transform can transform the vector in the global coordinate to the local coordinate
     * @memberof! imMatch.Scene#
     */
    computeAffineTransform2Local: function() {
        return this.computeAppliedTransform().
                    preConcatenate(imMatch.viewport.computeAffineTransform2Local());
    },

    /**
     * Deserializes data to a Scene object
     * @param {Object} data Serialized data
     * @returns {Object} Result A Scene object which including the serialized data
     * @memberof! imMatch.Scene#
     */
    deserialize: function(data) {
        var self = this;
        jQuery.each(data.sprites, function(i, serializedSprite) {
            if (serializedSprite.sceneID !== data.id) {
                return;
            }

            var sprite = new imMatch.Sprite();
            sprite.scene = self;
            sprite.deserialize(serializedSprite);
            self.addSprite(sprite, serializedSprite.z);
        });

        delete data.sprites;

        return jQuery.extend(this, data);
    },

    /**
     * Determines whether the scene is touched.
     * @param {Object} touchMouseEvent A touchMouseEvent
     * @returns {Boolean} Result True if the scene is touched; otherwise, false
     * @memberof! imMatch.Scene#
     */
    isTouched: function(touchMouseEvent) {
        if (!imMatch.is2DVector(touchMouseEvent) || imMatch.isEmpty(touchMouseEvent.coordinate) ||
                imMatch.coordinate.scene !== touchMouseEvent.coordinate) {
            return false;
        }

        if (-this.width / 2 <= touchMouseEvent.x && touchMouseEvent.x <= this.width / 2 &&
            -this.height / 2 <= touchMouseEvent.y && touchMouseEvent.y <= this.height / 2) {
            return true;
        }

        return false;
    },

    /**
     * Adds a sprite assigned the z-order.
     * @param {Sprite} sprite A Sprite object
     * @param {Int} defaultSpriteZ The default z-order of the sprite
     * @memberof! imMatch.Scene#
     */
    addSprite: function(sprite, defaultSpriteZ) {
        if (jQuery.isEmptyObject(sprite)) {
            return this;
        }

        if (this.maxNumSprites <= this.sprites.length) {
            imMatch.logWarn("[imMatch.Scene.addSprite] The scene is full of sprites. max: " + this.maxNumSprites);
            return this;
        }

        sprite.setContainedScene(this, defaultSpriteZ);
        ++this.spriteZ;

        push.call(this.sprites, sprite);
        this.sprites.sort(function(a, b) {
            var diff = a.z - b.z;
            if (0 !== diff) {
                return diff;
            }

            return (a.id > b.id)? 1 : -1;
        });

        return this;
    }
});

jQuery.extend(imMatch, {
    /**
     * All of the current scenes. It is sorted by the scene's z-roder and scene's ID.
     * @default
     * @memberof! imMatch#
     */
    scenes: [],

    /**
     * Adds a scene into imMatch.scenes.
     * @see imMatch#scenes
     * @param {Scene} scene A scene
     * @memberof! imMatch#
     */
    addScene: function(scene) {
        if (jQuery.isEmptyObject(scene)) {
            imMatch.logError("[imMatch.engine.addScene] Scene is empty.");
            return this;
        }

        push.call(imMatch.scenes, scene);
        imMatch.scenes.sort(function(a, b) {
            var diff = a.z - b.z;
            if (0 !== diff) {
                return diff;
            }

            return (a.id > b.id)? 1 : -1;
        });

        return this;
    },

    /**
     * Removes a scene from imMatch.scenes.
     * @see imMatch#scenes
     * @param {Scene} removedScene A removed scene
     * @memberof! imMatch#
     */
    removeScene: function(removedScene) {
        imMatch.scenes = jQuery.grep(imMatch.scenes, function(scene) {
            return (removedScene.id !== scene.id);
        });

        if (imMatch.scenes.length === 0) {
            sceneZ = 0;
        }

        return this;
    }
});