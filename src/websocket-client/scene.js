imMatch.Scene = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene();
    }

    this.id = Math.uuidFast();

    this.z = sceneZ++;
    this.width = imMatch.viewport.width;
    this.height = imMatch.viewport.height;

    this.sprites = [];
    this.spriteZ = 0;
    this.maxNumSprites = 100;

    this.affineTransform = new imMatch.AffineTransform;
};

jQuery.extend(imMatch.Scene.prototype, imMatch.transformPrototype, {
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

        if (this.maxNumSprites < this.sprites.length) {
            imMatch.logWarn("[imMatch.Scene.addSprite] The scene is full of sprites. max: " + this.maxNumSprites);
            return this;
        }

        sprite.setContainedScene(this);
        ++this.spriteZ;

        this.sprites.push(sprite);
        this.sprites.sort(function(a, b) {
            return b.z - a.z;
        });

        return this;
    },

    transformWithCoordinate: function(vec, /* Optional */ deep) {
        var target = {}, result;
        deep = deep || false;
        target = (deep)? jQuery.extend(target, vec) : vec;
        switch(target.coordinate) {
            // Local -> Global -> Scene
            case imMatch.coordinate.local:
                target.coordinate = imMatch.coordinate.scene; 
                result = this.inverseTransform(imMatch.viewport.inverseTransform(target));
            break;
            // Global -> Scene
            case imMatch.coordinate.global:
                target.coordinate = imMatch.coordinate.scene;
                result = this.inverseTransform(target);
            break;
            // Scene -> Global
            case imMatch.coordinate.scene:
                target.coordinate = imMatch.coordinate.global;
                result = this.transform(copyVec);
            break;
            default:
                imMatch.logError("[imMatch.scene.transformWithCoordinate] The coordinate is invalid! Coordinate: " + target.coordinate);
            break;
        }

        jQuery.extend(target, result);
        return target;
    }
});

jQuery.extend(imMatch, {
    scenes: [],

    addScene: function(scene) {
        if (jQuery.isEmptyObject(scene)) {
            imMatch.logError("[imMatch.engine.addScene] Scene is empty.");
            return this;
        }

        imMatch.scenes.push(scene);
        imMatch.scenes.sort(function(a, b) {
            return b.z - a.z;
        });

        return this;
    },

    removeScene: function(removedScene) {
        imMatch.scenes = jQuery.grep(imMatch.scenes, function(n, i) {
            return (removedScene.id != scene.id);
        });

        if (imMatch.scenes.length == 0) {
            sceneZ = 0;
        }

        return this;
    }
});