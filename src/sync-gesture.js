var cursorGroups,
    cursorGroupID = 0,
    Threadshold = {
        DISTANCE: 2,
        SAMPLING_TIME: 50, // ms
        STRAIGHT: Math.PI / 20 // rad
    };

imMatch.Cursor = function(points) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cursor) ) {
        return new imMatch.Cursor(touchMouseEvent);
    }

    this.points = [];
    this.add(points);
};

imMatch.Cursor.prototype = {
    add: function(points) {
        var numPoints, self = this;
        if (!points) {
            return;
        }

        if(!imMatch.isArray(points)) {
            points = [points];
        }

        imMatch.each(points, function(i, point) {
            self.points.push(point);
        });

        numPoints = points.length;
        this.type = points[numPoints-1].type;
        this.id = points[numPoints-1].id;
    },

    isStraight: function() {
        var result = true, lastPoint = this.points[0], lastVelocity;
        imMatch.each(this.points, function(i, point) {
            // Sampling each Threadshold.SAMPLING_TIME ms
            var duration = point.timestamp - lastPoint.timestamp, velocity;
            if (duration < Threadshold.SAMPLING_TIME) {
                return;
            }
            velocity = {
                x: (point.x - lastPoint.x) / duration,
                y: (point.y - lastPoint.y) / duration
            };

            if (lastVelocity && 
                imMatch.rad(velocity, lastVelocity) > Threadshold.STRAIGHT) {
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
        if (!cursors) {
            return;
        }

        if(!imMatch.isArray(cursors)) {
            cursors = [cursors];
        }

        imMatch.each(cursors, function(i, cursor) {
            if (!self.cursors[cursor.id]) {
                self.cursors[cursor.id] = {};
                imMatch.extend(self.cursors[cursor.id], cursor);
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
        imMatch.each(this.cursors, function(cursorID, cursor) {
            var lastPoint = cursor.points[cursor.points.length - 1];
            if (imMatch.norm(point, lastPoint) <= Threadshold.DISTANCE) {
                result = true;
                return false;
            }
        });

        return result;
    },

    isAllCursorsUp: function() {
        var numUpCursors = 0;
        imMatch.each(this.cursors, function(cursorID, cursor) {
            if (cursor.type == TouchMouseEvent.UP || cursor.type == TouchMouseEvent.CANCEL) {
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
        imMatch.each(this.cursors, function(cursorID, cursor) {
            if (!cursor.isStraight()) {
                result = false;
                return false;
            }
        });

        return result;
    }
};

cursorGroups = {};

imMatch.syncGesture = {
    recognize: function(touchMouseEvent) {
        imMatch.logError("[" + touchMouseEvent.type + "] " + touchMouseEvent.x + ", " + 
            touchMouseEvent.y + "(" + touchMouseEvent.id + ")");
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return;
        }

        this[handler](touchMouseEvent);
    },

    touchmousedownHandler: function(touchMouseEvent) {
        this.addCursorGroup(touchMouseEvent);
    },

    touchmouseupHandler: function(touchMouseEvent) {
        var group = this.searchContainCursorGroup(touchMouseEvent);
        this.touchmousemoveHandler(touchMouseEvent);

        if (!group.isAllCursorsUp()) {
            return;
        }

        this.tryToStitch(group);
        delete cursorGroups[group.id];
    },

    touchmousemoveHandler: function(touchMouseEvent) {
        var containGroup = this.searchContainCursorGroup(touchMouseEvent),
            ownGroup = this.searchOwnCursorGroup(touchMouseEvent);

        if (!containGroup) {
            imMatch.logError("containGroup: " + containGroup);
        }
        if (!ownGroup) {
            imMatch.logError("ownGroup: " + ownGroup);
        }

        if (containGroup.id != ownGroup.id) {
            imMatch.logError("meger agroup" + containGroup.id + ", " + ownGroup.id);
            containGroup.add(ownGroup);
            delete cursorGroups[ownGroup.id];
        }

        containGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
    },

    touchmousecancelHandler:function(touchMouseEvent) {
        this.touchmouseupHandler(touchMouseEvent);
    },

    searchOwnCursorGroup: function(touchMouseEvent) {
        var targetGroup;
        imMatch.each(cursorGroups, function(groupID, group) {
            if (group.hasOwnPoint(touchMouseEvent)) {
                targetGroup = group;
                return false;
            }
        });

        return targetGroup;
    },

    searchContainCursorGroup: function(touchMouseEvent) {
        var targetGroup, ownGroup;
        imMatch.each(cursorGroups, function(groupID, group) {
            if (group.hasOwnPoint(touchMouseEvent)) {
                ownGroup = group;
                return;
            }

            if (group.hasConatinPoint(touchMouseEvent)) {
                targetGroup = group;
                return false;
            }
        });

        targetGroup = targetGroup || ownGroup;
        return targetGroup;
    },

    addCursorGroup: function(touchMouseEvent) {
        var targetGroup = this.searchContainCursorGroup(touchMouseEvent);
        if (!targetGroup) {
            // New Cursor and Group
            targetGroup = new imMatch.CursorGroup(new imMatch.Cursor(touchMouseEvent));
            cursorGroups[targetGroup.id] = targetGroup;
        }
        else {
            targetGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
        }

        return this;
    },

    tryToStitch: function(group) {
        // Criteria 1: Cursor is straight
        if (!group.isAllCursorsStraight()) {
            imMatch.logError("isAllCursorsStraight");
            return;   
        }

        // Criteria 2: Start touch is out of the stitching region and End touch is in the stitching region

        // Criteria 3: Cursor is perpendicular to the boundary of window

        imMatch.logError("tryToStitch");
    }
};