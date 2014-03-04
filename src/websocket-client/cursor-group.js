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
                imMatch.rad(velocity, lastVelocity) > imMatch.threadsholdAboutSyncGesture.straight) {
                result = false;
                return false;
            }

            lastPoint = point;
            lastVelocity = velocity;
        });

        return result;
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
                self.cursors[cursor.id] = {};
                jQuery.extend(self.cursors[cursor.id], cursor);
            }
            else {
                self.cursors[cursor.id].add(cursor.points);
                self.cursors[cursor.id].type = cursor.type;
            }
        });

        this.numCursors += cursors.length;
    },

    hasOwnPoint: function(point) {
        return (this.cursors[point.id])? true : false;
    },

    hasConatinPoint: function(point) {
        var result = false;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            var lastPoint = cursor.points[cursor.points.length - 1];
            if (imMatch.norm(point, lastPoint) <= imMatch.threadsholdAboutSyncGesture.distance) {
                result = true;
                return false;
            }
        });

        return result;
    },

    isAllCursorsUp: function() {
        var numUpCursors = 0;
        jQuery.each(this.cursors, function(cursorID, cursor) {
            if (cursor.type == imMatch.touchMouseEventType.up || cursor.type == imMatch.touchMouseEventType.cancel) {
                ++numUpCursors;
            }
        });

        if (numUpCursors == this.numCursors) {
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
    }
};

jQuery.extend(imMatch, {
    cursorGroups: {}
});