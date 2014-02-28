var sceneZ = 0; // Be reset if there is no any scene.

imMatch.Scene = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Scene) ) {
        return new imMatch.Scene();
    }

    // Global Coordinate: The origin is initialized as the center of imMatch.viewport
    this.x = imMatch.viewport.x;
    this.y = imMatch.viewport.y;
    this.z = sceneZ++;
    this.width = imMatch.viewport.width;
    this.height = imMatch.viewport.height;
    this.rad = imMatch.viewport.rad;
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
        if (!imMatch.is2DVector(point)) {
            return false;
        }

        if (this.x - this.width / 2 <= point.x && point.x <= this.x + this.width / 2 &&
            this.y - this.height / 2 <= point.y && point.y <= this.y + this.height / 2) {
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