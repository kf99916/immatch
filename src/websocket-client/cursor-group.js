/**
 * Creates a cursor object.
 * @class
 * @classdesc A cursor constists of all touchMouseEvent which is the same ID.
 * @constructor
 * @param {Object} touchMouseEvent A touchMouseEvent
 */
imMatch.Cursor = function(touchMouseEvent) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cursor) ) {
        return new imMatch.Cursor(touchMouseEvent);
    }

    this.points = [];
    this.numPoints = 0;
    this.add(touchMouseEvent);
};

imMatch.Cursor.prototype = {
    /**
     * AAdds all points into the cursor
     * @param {Array} points A point array contained touchMouseEvents
     */
    add: function(points) {
        var self = this;
        if (jQuery.isEmptyObject(points)) {
            return;
        }

        if(!jQuery.isArray(points)) {
            points = [points];
        }

        jQuery.each(points, function(i, point) {
            if (self.numPoints === 0) {
                self.coordinate = point.coordinate;
            }
            else if (self.coordinate !== point.coordinate) {
                return;
            }

            push.call(self.points, point);
            ++self.numPoints;
        });

        this.type = this.points[this.numPoints-1].type;
        this.id = this.points[this.numPoints-1].id;
    },

    /**
     * Computes a vector of the cursor
     * @returns {Object}
     */
    getVector: function() {
        var startPoint = this.points[0], endPoint = this.points[this.numPoints-1];

        return {
            x: endPoint.x - startPoint.x,
            y: endPoint.y - startPoint.y,
            coordinate: this.coordinate
        };
    },

    /**
     * Determins whether the cursor is enogh straight or not.
     * @returns {Boolean} Result True if the cursor is enogh straight; otherwise, false.
     */
    isStraight: function() {
        var result = true, lastPoint = this.points[0], lastVelocity;
        jQuery.each(this.points, function(i, point) {
            // Sampling each imMatch.threadsholdAboutSyncGesture.samplingTime ms
            var duration = point.timeStamp - lastPoint.timeStamp, velocity;
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

    /**
     * Determins whether the cursor fits some stitching region criteria.
     * The criteria: The start point is out of the region, but the end point is in the region.
     * @returns {Boolean} Result True if the cursor fits the criteria; otherwise, false.
     */
    isFitStitchingRegionCriteria: function() {
        var startPoint = this.points[0], endPoint = this.points[this.numPoints-1];
        if (startPoint.type !== imMatch.touchMouseEventType.down ||
            (endPoint.type !== imMatch.touchMouseEventType.up && endPoint.type !== imMatch.touchMouseEventType.cancel)) {
            return false;
        }

        if (!imMatch.isInStitchingRegion(startPoint) && imMatch.isInStitchingRegion(endPoint)) {
            return true;
        }

        return false;
    },

    /**
     * Determins whether the cursor is perpendicular to the boundary of the device.
     * @returns {Boolean} Result True if the cursor is perpendicular to the boundary of the device; otherwise, false.
     */
    isPerpendicularToBoundary: function() {
        var perpendicularRadDiff = imMatch.threadsholdAboutSyncGesture.perpendicularRadDiff,
            vec = this.getVector(),
            radBetweenHorizontal = Math.abs(imMatch.rad(vec, {x: 1, y: 0})),
            radBetweenVertical = Math.abs(imMatch.rad(vec, {x: 0, y: 1}));

        if (Math.abs(radBetweenHorizontal - Math.PI/2) > perpendicularRadDiff &&
            Math.abs(radBetweenVertical - Math.PI/2) > perpendicularRadDiff) {

            return false;
        }

        return true;
    }
};

/**
 * Creates a cursor group object.
 * @class
 * @classdesc A cursor group constists of all cursors which is closed with each other.
 * @constructor
 * @param {Array} cursors A cursor array contained cursors
 */
imMatch.CursorGroup = function(cursors) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.CursorGroup) ) {
        return new imMatch.CursorGroup(cursors);
    }

    this.cursors = {};
    this.numCursors = 0;
    this.id = Math.uuidFast();
    this.add(cursors);
};

imMatch.CursorGroup.prototype = {
    /**
     * Adds all curosrs into the cursor group
     * @param {Array} cursors A cursor array contained cursors
     */
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

    /**
     * Removes a given cursor from the group
     * @param {Object} cursors A removed cursor
     */
    removeCursor: function(cursor) {
        if (jQuery.isEmptyObject(cursor)) {
            return null;
        }

        delete this.cursors[cursor.id];
        --this.numCursors;

        return this;
    },

    /**
     * Computes the start and end centers in the cursor group.
     * @returns {Object} Result The start and end centers. {start: {x: float, y: float}, end: {x: float, y: float}}
     */
    computeStartEndCenters: function() {
        var startCenter = {x: 0, y: 0},
            endCenter = {x: 0, y: 0},
            coordinate;

        jQuery.each(this.cursors, function(id, cursor) {
            var startPoint = cursor.points[0], endPoint = cursor.points[cursor.numPoints-1];
            if (imMatch.isEmpty(coordinate)) {
                coordinate = cursor.coordinate;
            }
            else if (coordinate !== cursor.coordinate) {
                coordinate = null;
                return false;
            }

            startCenter.x += startPoint.x;
            startCenter.y += startPoint.y;

            endCenter.x += endPoint.x;
            endCenter.y += endPoint.y;
        });

        if (imMatch.isEmpty(coordinate)) {
            return null;
        }

        startCenter.x /= this.numCursors;
        startCenter.y /= this.numCursors;
        endCenter.x /= this.numCursors;
        endCenter.y /= this.numCursors;

        startCenter.coordinate = coordinate;
        endCenter.coordinate = coordinate;

        return {
            start: startCenter,
            end: endCenter
        };
    },

    /**
     * Computes the start and end distances in the cursor group.
     * @returns {Object} Result The start and end distances. {start: float, end: float}
     */
    computeStartEndDistances: function() {
        var startEndPoints = [], coordinate;
        if (this.numCursors < 2) {
            return {start: 0, end: 0};
        }

        jQuery.each(this.cursors, function(id, cursor) {
            if (imMatch.isEmpty(coordinate)) {
                coordinate = cursor.coordinate;
            }
            else if (coordinate !== cursor.coordinate) {
                coordinate = null;
                return false;
            }

            push.call(startEndPoints, {
                start: cursor.points[0],
                end: cursor.points[cursor.numPoints-1]
            });
        });

        if (imMatch.isEmpty(coordinate)) {
            return {start: 0, end: 0};
        }

        return {
            start: imMatch.norm({
                        x: startEndPoints[this.numCursors-1].start.x - startEndPoints[0].start.x,
                        y: startEndPoints[this.numCursors-1].start.y - startEndPoints[0].start.y}),
            end: imMatch.norm({
                        x: startEndPoints[this.numCursors-1].end.x - startEndPoints[0].end.x,
                        y: startEndPoints[this.numCursors-1].end.y - startEndPoints[0].end.y})
        };
    },

    /**
     * Computes the start and end vectors in the cursor group.
     * @returns {Object} Result The start and end vectors. {start: {x: float, y: float}, end: {x: float, y: float}}
     */
    computeStartEndVectors: function() {
        var startEndPoints = [], coordinate;
        if (this.numCursors < 2) {
            return {start: {x: 0, y: 0}, end: {x: 0, y: 0}};
        }

        jQuery.each(this.cursors, function(id, cursor) {
            if (imMatch.isEmpty(coordinate)) {
                coordinate = cursor.coordinate;
            }
            else if (coordinate !== cursor.coordinate) {
                coordinate = null;
                return false;
            }

            push.call(startEndPoints, {
                start: cursor.points[0],
                end: cursor.points[cursor.numPoints-1]
            });
        });

        if (imMatch.isEmpty(coordinate)) {
            return {start: {x: 0, y: 0}, end: {x: 0, y: 0}};
        }

        return {
            start: { x: startEndPoints[1].start.x - startEndPoints[0].start.x,
                    y: startEndPoints[1].start.y - startEndPoints[0].start.y},
            end: { x: startEndPoints[1].end.x - startEndPoints[0].end.x,
                    y: startEndPoints[1].end.y - startEndPoints[0].end.y}
        };
    },

    /**
     * Computes the stitching information according to cursors.
     * @returns {Object} Result The stitching information
     */
    computeStitchingInfo: function() {
        var stitchingInfo = {},
            globalStartEndCenters = this.computeStartEndCenters(), localStartEndCenters = {},
            globalVector, localVector;

        localStartEndCenters.start = imMatch.viewport.transformWithCoordinate(globalStartEndCenters.start, true);
        localStartEndCenters.end = imMatch.viewport.transformWithCoordinate(globalStartEndCenters.end, true);

        globalVector = {
            x: globalStartEndCenters.end.x - globalStartEndCenters.start.x,
            y: globalStartEndCenters.end.y - globalStartEndCenters.start.y
        };

        localVector = {
            x: localStartEndCenters.end.x - localStartEndCenters.start.x,
            y: localStartEndCenters.end.y - localStartEndCenters.start.y
        };

        // Compute orientation
        stitchingInfo.orientation = {x: 0, y: 0};
        if (globalVector.y === 0 || Math.abs(globalVector.x / globalVector.y) > 1) {
            stitchingInfo.orientation.x = (globalVector.x > 0)? 1 : -1;
        }
        else if (globalVector.x === 0 || Math.abs(globalVector.y / globalVector.x) > 1) {
            stitchingInfo.orientation.y = (globalVector.y > 0)? 1 : -1;
        }

        // Compute margin & point
        stitchingInfo.margin = {x: 0, y: 0};
        if (localVector.y === 0 || Math.abs(localVector.x / localVector.y) > 1) {
            if (localVector.x > 0) {
                localStartEndCenters.end.x = imMatch.viewport.width;
                stitchingInfo.margin.x = -imMatch.device.margin.right;
            }
            else {
                localStartEndCenters.end.x = 0;
                stitchingInfo.margin.x = imMatch.device.margin.left;
            }
        }
        else if (localVector.x === 0 || Math.abs(localVector.y / localVector.x) > 1) {
            if (localVector.y > 0) {
                localStartEndCenters.end.y = imMatch.viewport.height;
                stitchingInfo.margin.y = -imMatch.device.margin.bottom;
            }
            else {
                localStartEndCenters.end.y = 0;
                stitchingInfo.margin.y = imMatch.device.margin.top;
            }
        }

        stitchingInfo.point = imMatch.viewport.transformWithCoordinate(localStartEndCenters.end);

        return stitchingInfo;
    },

    /**
     * Determins whether the cursor group owns a given point.
     * @param {Object} point The point
     * @returns {Boolean} True if the cursor group owns a given point; otherwise, false;
     */
    hasOwnPoint: function(point) {
        return (this.cursors[point.id])? true : false;
    },

    hasConatinPoint: function(point) {
        var result = false;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            var vec = {x: cursor.points[cursor.numPoints-1].x - point.x,
                        y: cursor.points[cursor.numPoints-1].y - point.y};

            if (imMatch.norm(vec) <= imMatch.threadsholdAboutSyncGesture.distance) {
                result = true;
                return false;
            }
        });

        return result;
    },

    /**
     * Determins whether all the cursors in the cursor group are up or not.
     * @returns {Boolean} True if all the cursors in the cursor group are up; otherwise, false;
     */
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

    /**
     * Determins whether all the cursors in the cursor group are enough straight or not.
     * @returns {Boolean} True if all the cursors in the cursor group are enough straight; otherwise, false;
     */
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

    /**
     * Determins whether all the cursors in the cursor group fit stitching region criteria or not.
     * @returns {Boolean} True if all the cursors in the cursor group fit stitching region criteria; otherwise, false;
     */
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

    /**
     * Determins whether all the cursors in the cursor group are perpendicular to the boundary of the device or not.
     * @returns {Boolean} True if all the cursors in the cursor group are perpendicular to the boundary of the device; otherwise, false;
     */
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
    /**
     * Determins whether a given point is in the stitching region or not.
     * @returns {Boolean} True if a given point is in the stitching region; otherwise, false;
     */
    isInStitchingRegion: function(point) {
        if (!imMatch.is2DVector(point)) {
            return false;
        }

        var stitchingRegionSize = imMatch.device.stitchingRegionSize,
            normalRegion = {x: stitchingRegionSize, y: stitchingRegionSize,
                width: imMatch.viewport.width - 2 * stitchingRegionSize,
                height: imMatch.viewport.height - 2 * stitchingRegionSize},
            localPoint = (point.coordinate === imMatch.coordinate.local)? point :
                                imMatch.viewport.transformWithCoordinate(point, true);

        if (normalRegion.x <= localPoint.x && localPoint.x <= normalRegion.x + normalRegion.width &&
            normalRegion.y <= localPoint.y && localPoint.y <= normalRegion.y + normalRegion.height) {
            return false;
        }

        return true;
    }
});