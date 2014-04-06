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

    this.viewportID = imMatch.viewport.id;
    this.width = imMatch.viewport.width;
    this.height = imMatch.viewport.height;

    this.sprites = [];
    this.spriteZ = 0;

    this.solid = false;
    this.movable = true;
    this.rotatable = true;
};

jQuery.extend(imMatch.Scene.prototype, imMatch.transformable.prototype, {
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

    getAffineTransform2Local: function() {
        return imMatch.viewport.getAppliedTransform().createInverse().
                    preConcatenate(this.getAppliedTransform()).
                    preConcatenate(imMatch.viewport.global2LocalTransform);
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