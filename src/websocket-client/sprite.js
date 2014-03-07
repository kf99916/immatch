imMatch.Sprite = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Sprite) ) {
        return new imMatch.Sprite();
    }

    this.id = Math.uuidFast();

    this.z = 0;
    this.width = this.height = 0;
    this.alpha = 1;
    this.scalingFactor = this.maxScalingFactor = this.minScalingFactor = 1;

    this.cursorGroup = new imMatch.CursorGroup();
    this.affineTransform = new imMatch.AffineTransform();

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
        var spritePoint, deviceImageRatio = imMatch.device.ppi / this.image.ppi;
        if (!this.touchable) {
            return false;
        }

        if (!imMatch.is2DVector(touchMouseEvent)) {
            return false;
        }

        spritePoint = this.transformWithCoordinate(touchMouseEvent, true);
        spritePoint.x *= deviceImageRatio;
        spritePoint.y *= deviceImageRatio;

        if (-this.width / 2 <= spritePoint.x && spritePoint.x <= this.width / 2 &&
            -this.height / 2 <= spritePoint.y && spritePoint.y <= this.height / 2) {
            return true;
        }
    },

    updateAffineTransform: function() {
        var center, vector, rad,
            distance, scalingFactor, newScalingFactor;
        if (this.movable) {
            center = this.cursorGroup.computeStartEndCenters();
            this.translate({x: center.end.x - center.start.x, y: center.end.y - center.start.y});
        }

        if (this.rotatable && this.cursorGroup.numCursors === 2) {
            vector = this.cursorGroup.computeStartEndVectors();
            rad = imMatch.rad(vector.start, vector.end);
            this.rotate(rad, center.start);
        }

        if (this.scalable && this.cursorGroup.numCursors === 2) {
            distance = this.cursorGroup.computeDistances();
            scalingFactor = distance.end / distance.start || 1;
            newScalingFactor = this.scalingFactor * scalingFactor;

            if (newScalingFactor <= this.minScalingFactor) {
                scalingFactor = this.minScalingFactor / this.scalingFactor;
            }
            else if (newScalingFactor >= this.maxScalingFactor) {
                scalingFactor = this.maxScalingFactor / this.scalingFactor;
            }

            this.scalingFactor *= scalingFactor;

            this.scale({x: scalingFactor, y: scalingFactor});
        }
    },

    updateCursorGroup: function() {
        var self = this;
        jQuery.each(this.cursorGroup.cursors, function(id, cursor) {
            var lastPoint;
            switch(cursor.type) {
                case imMatch.touchMouseEventType.up: case imMatch.touchMouseEventType.cancel:
                    self.cursorGroup.removeCursor(cursor);
                break;
                case imMatch.touchMouseEventType.down: case imMatch.touchMouseEventType.move:
                    lastPoint = cursor.points[cursor.points.length-1];
                    self.cursorGroup.cursors[id].points = [lastPoint];
                break;
                default:
                    lastPoint = cursor.points[cursor.points.length-1];
                    self.cursorGroup.cursors[id].points = [lastPoint];
                break;
            }
        });
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