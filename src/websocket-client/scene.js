var sceneZ = 0; // Be reset if there is no any scene.

imMatch.Scene = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene();
    }

    this.z = sceneZ++;
    this.width = imMatch.viewport.width;
    this.height = imMatch.viewport.height;

    this.affineTransform = new imMatch.AffineTransform;

    this.id = Math.uuidFast();

    this.sprites = [];
    this.spriteZ = 0;
    this.maxNumSprites = 100;
    
    imMatch.on("contextWillbeDrawn", this.contextWillbeDrawnHandler);
};

imMatch.Scene.prototype = {
    contextWillbeDrawnHandler: function(event) {
    },

    isTouched: function(point) {
        var scenePoint;
        if (!imMatch.is2DVector(point)) {
            return false;
        }

        scenePoint = this.transformFromGlobal2Scene(point);

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

    transformFromGlobal2Scene: function(vec) {
        return this.affineTransform.transform(vec);
    },

    transformFromScene2Global: function(vec) {
        return this.affineTransform.createInverse().transform(vec);
    }
};

imMatch.scenes = [];

jQuery.extend(imMatch, {
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