imMatch.Scene = function(incrementSceneZ) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene(incrementSceneZ);
    }

    incrementSceneZ = incrementSceneZ || true;

    this.id = Math.uuidFast();

    this.z = sceneZ;
    if (incrementSceneZ) {
        ++sceneZ;
    }

    this.viewport = imMatch.viewport;
    this.width = this.viewport.width;
    this.height = this.viewport.height;

    this.sprites = [];
    this.spriteZ = 0;

    this.translationFactor = {x: 0, y: 0};
    this.rad = 0;
};

jQuery.extend(imMatch.Scene.prototype, imMatch.transformable, {
    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target = {}, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        switch(target.coordinate) {
            // Local -> Global -> Scene
            case imMatch.coordinate.local:
                target.coordinate = imMatch.coordinate.scene;
                result = this.viewport.inverseTransform(this.inverseTransform(target));
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

    getAppliedTransform: function() {
        return imMatch.AffineTransform.getTranslationInstance(this.translationFactor).preRotate(this.rad);
    },

    getAffineTransform2Local: function() {
        return this.viewport.getAppliedTransform().createInverse().
                    preConcatenate(this.getAppliedTransform()).
                    preConcatenate(this.viewport.getAffineTransform2Local());
    },

    serialize: function() {
        return {
            id: this.id,
            z: this.z,
            width: this.width,
            height: this.height,
            translationFactor: this.translationFactor,
            rad: this.rad,
            spriteZ: this.spriteZ
        };
    },

    translate: function(translationFactor) {
        this.translationFactor.x += translationFactor.x;
        this.translationFactor.y += translationFactor.y;
        return this;
    },

    rotate: function(rad) {
        this.rad += rad;
        return this;
    },

    scale: function() {
        return this;
    },

    shear: function() {
        return this;
    },

    isTouched: function(point) {
        var scenePoint;
        if (!imMatch.is2DVector(point)) {
            return false;
        }

        scenePoint = this.transformWithCoordinate(point, true);

        if (-this.width / 2 <= scenePoint.x && scenePoint.x <= this.width / 2 &&
            -this.height / 2 <= scenePoint.y && scenePoint.y <= this.height / 2) {
            return true;
        }
    },

    addSprite: function(sprite) {
        if (jQuery.isEmptyObject(sprite)) {
            return this;
        }

        if (imMatch.maxNumSpritesInScene < this.sprites.length) {
            imMatch.logWarn("[imMatch.Scene.addSprite] The scene is full of sprites. max: " + imMatch.maxNumSpritesInScene);
            return this;
        }

        sprite.setContainedScene(this);
        ++this.spriteZ;

        push.call(this.sprites, sprite);
        this.sprites.sort(function(a, b) {
            return b.z - a.z;
        });

        return this;
    }
});

jQuery.extend(imMatch, {
    scenes: [],

    maxNumSpritesInScene: 100,

    addScene: function(scene) {
        if (jQuery.isEmptyObject(scene)) {
            imMatch.logError("[imMatch.engine.addScene] Scene is empty.");
            return this;
        }

        push.call(imMatch.scenes, scene);
        imMatch.scenes.sort(function(a, b) {
            return b.z - a.z;
        });

        return this;
    },

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