imMatch.Scene = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene();
    }

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

        scenePoint = this.transformWithCoordinate(point);

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

    transformWithCoordinate: function(vec) {
        switch(vec.coordinate) {
            // Global -> Scene
            case imMatch.coordinate.global:
                vec.coordinate = imMatch.coordinate.scene; 
                return this.inverseTransform(vec);
            break;
            // Scene -> Global
            case imMatch.coordinate.scene:
                vec.coordinate = imMatch.coordinate.global;
                return this.transform(vec);
            break;
            default:
            break;
        }
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
        jQuery.each(imMatch.scenes, function(i, scene) {
            if (removedScene.id == scene.id) {
                imMatch.remove(imMatch.scenes, i);
                return false;
            }
        });

        if (imMatch.scenes.length == 0) {
            sceneZ = 0;
        }

        return this;
    }
});