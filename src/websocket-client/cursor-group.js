imMatch.Cursor = function(touchMouseEvent) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cursor) ) {
        return new imMatch.Cursor(touchMouseEvent);
    }

    this.points = [];
    this.add(touchMouseEvent);
};

imMatch.Cursor.prototype = {
    add: function(points) {
        var numPoints, self = this;
        if (jQuery.isEmptyObject(points)) {
            return;
        }

        if(!jQuery.isArray(points)) {
            points = [points];
        }

        jQuery.each(points, function(i, point) {
            self.points.push(point);
        });

        numPoints = points.length;
        this.type = points[numPoints-1].type;
        this.id = points[numPoints-1].id;
    },

    isStraight: function() {
        var result = true, lastPoint = this.points[0], lastVelocity;
        jQuery.each(this.points, function(i, point) {
            // Sampling each imMatch.threadsholdAboutSyncGesture.samplingTime ms
            var duration = point.timestamp - lastPoint.timestamp, velocity;
            if (duration < imMatch.threadsholdAboutSyncGesture.samplingTime) {
                return;
            }
            velocity = {
                x: (point.x - lastPoint.x) / duration,
                y: (point.y - lastPoint.y) / duration
            };

            if (!jQuery.isEmptyObject(lastVelocity) &&
                Math.abs(imMatch.rad(velocity, lastVelocity)) > imMatch.threadsholdAboutSyncGesture.straight) {
                result = false;
                return false;
            }

            lastPoint = point;
            lastVelocity = velocity;
        });

        return result;
    },

    isFitStitchingRegionCriteria: function() {
        var numPoints = this.points.length,
            startPoint = this.points[0], endPoint = this.points[numPoints-1];
        if (startPoint.type !== imMatch.touchMouseEventType.down ||
            (endPoint.type !== imMatch.touchMouseEventType.up && endPoint.type !== imMatch.touchMouseEventType.cancel)) {
            return false;
        }

        if (!imMatch.isInStitchingRegion(startPoint) && imMatch.isInStitchingRegion(endPoint)) {
            return true;
        }

        return false;
    },

    isPerpendicularToBoundary: function() {
        var perpendicularRadDiff = imMatch.threadsholdAboutSyncGesture.perpendicularRadDiff,
            numPoints = this.points.length,
            startPoint = this.points[0], endPoint = this.points[numPoints-1],
            vec = {
                x: endPoint.x - startPoint.x,
                y: endPoint.y - startPoint.y
            },
            radBetweenHorizontal = Math.abs(imMatch.rad(vec, {x: 1, y: 0})),
            radBetweenVertical = Math.abs(imMatch.rad(vec, {x: 0, y: 1}));

        if (Math.abs(radBetweenHorizontal - Math.PI/2) > perpendicularRadDiff &&
            Math.abs(radBetweenVertical - Math.PI/2) > perpendicularRadDiff) {

            return false;
        }

        return true;
    }
};

imMatch.CursorGroup = function(cursors) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.CursorGroup) ) {
        return new imMatch.CursorGroup(cursors);
    }

    this.cursors = {};
    this.numCursors = 0;
    this.id = cursorGroupID++;
    this.add(cursors);
};

imMatch.CursorGroup.prototype = {
    add: function(cursors) {
        var self = this;
        if (jQuery.isEmptyObject(cursors)) {
            return;
        }

        if(!jQuery.isArray(cursors)) {
            cursors = [cursors];
        }

        jQuery.each(cursors, function(i, cursor) {
            if (!self.cursors[cursor.id]) {
                self.cursors[cursor.id] = new imMatch.Cursor();
            }

            self.cursors[cursor.id].add(cursor.points);
            self.cursors[cursor.id].type = cursor.type;
        });

        this.numCursors += cursors.length;
        return this;
    },

    removeCursor: function(cursor) {
        if (jQuery.isEmptyObject(cursor)) {
            return null;
        }

        delete this.cursors[cursor.id];
        --this.numCursors;

        return this;
    },

    computeStartEndCenters: function() {
        var startCenter = {x: 0, y: 0},
            endCenter = {x: 0, y: 0};

        jQuery.each(this.cursors, function(id, cursor) {
            var numPoints = cursor.points.length;
            startCenter.x += cursor.points[0].x;
            startCenter.y += cursor.points[0].y;

            endCenter.x += cursor.points[numPoints-1].x;
            endCenter.y += cursor.points[numPoints-1].y;
        });

        startCenter.x /= this.numCursors;
        startCenter.y /= this.numCursors;
        endCenter.x /= this.numCursors;
        endCenter.y /= this.numCursors;

        return {
            start: startCenter,
            end: endCenter
        };
    },

    computeDistances: function() {
        var startEndPoints = [];
        if (this.numCursors > 2) {
            return {};
        }

        jQuery.each(this.cursors, function(id, cursor) {
            var numPoints = cursor.points.length;

            startEndPoints.push({
                start: cursor.points[0],
                end: cursor.points[numPoints-1]
            });
        });

        return {
            start: imMatch.norm({
                        x: startEndPoints[1].start.x - startEndPoints[0].start.x,
                        y: startEndPoints[1].start.y - startEndPoints[0].start.y}),
            end: imMatch.norm({
                        x: startEndPoints[1].end.x - startEndPoints[0].end.x,
                        y: startEndPoints[1].end.y - startEndPoints[0].end.y})
        };
    },

    computeStartEndVectors: function() {
        var startEndPoints = [];
        if (this.numCursors > 2) {
            return {};
        }

        jQuery.each(this.cursors, function(id, cursor) {
            var numPoints = cursor.points.length;

            startEndPoints.push({
                start: cursor.points[0],
                end: cursor.points[numPoints-1]
            });
        });

        return {
            start: { x: startEndPoints[1].start.x - startEndPoints[0].start.x,
                    y: startEndPoints[1].start.y - startEndPoints[0].start.y},
            end: { x: startEndPoints[1].end.x - startEndPoints[0].end.x,
                    y: startEndPoints[1].end.y - startEndPoints[0].end.y}
        };
    },

    hasOwnPoint: function(point) {
        return (this.cursors[point.id])? true : false;
    },

    hasConatinPoint: function(point) {
        var result = false;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            var numPoints = cursor.points.length,
                vec = {x: cursor.points[numPoints-1].x - point.x,
                        y: cursor.points[numPoints-1].y - point.y};

            if (imMatch.norm(vec) <= imMatch.threadsholdAboutSyncGesture.distance) {
                result = true;
                return false;
            }
        });

        return result;
    },

    isAllCursorsUp: function() {
        var numUpCursors = 0;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            if (cursor.type === imMatch.touchMouseEventType.up || cursor.type === imMatch.touchMouseEventType.cancel) {
                ++numUpCursors;
            }
        });

        if (numUpCursors === this.numCursors) {
            return true;
        }

        return false;
    },

    isAllCursorsStraight: function() {
        var result = true;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            if (!cursor.isStraight()) {
                result = false;
                return false;
            }
        });

        return result;
    },

    // All of DOWN points is out of the stitching area and UP or CANCEL points is in the stitching area
    isAllCurosrsFitStitchingRegionCriteria: function() {
        var result = true;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            if (!cursor.isFitStitchingRegionCriteria()) {
                result = false;
                return false;
            }
        });

        return result;
    },

    isAllCursorsPerpendicularToBoundary: function() {
        var result = true;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            if (!cursor.isPerpendicularToBoundary()) {
                result = false;
                return false;
            }
        });

        return result;
    }
};

jQuery.extend(imMatch, {
    cursorGroups: {},

    isInStitchingRegion: function(point) {
        if (!imMatch.is2DVector(point)) {
            return false;
        }

        var normalRegion = imMatch.viewport.transformWithCoordinate({x: 0, y: 0, coordinate: imMatch.coordinate.global}),
            localPoint = (point.coordinate === imMatch.coordinate.local)? point :
                                imMatch.viewport.transformWithCoordinate(point, true);
        normalRegion.width = imMatch.viewport.width - 2 * imMatch.device.stitchingRegionSize;
        normalRegion.height = imMatch.viewport.height - 2 * imMatch.device.stitchingRegionSize;

        if (normalRegion.x - normalRegion.width/2 <= localPoint.x && localPoint.x <= normalRegion.x + normalRegion.width/2 &&
            normalRegion.y - normalRegion.height/2 <= localPoint.y && localPoint.y <= normalRegion.y + normalRegion.height/2) {
            return false;
        }

        return true;
    }
});