jQuery.extend(imMatch, {
    threadsholdAboutSyncGesture: {
        distance: 2,
        samplingTime: 50, // ms
        straight: Math.PI / 20,
        perpendicularRadDiff: 0.15
    }
});

imMatch.syncGesture = {
    recognize: function(touchMouseEvent) {
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return;
        }

        this[handler](touchMouseEvent);
    },

    touchmousedownHandler: function(touchMouseEvent) {
        return this.addCursorGroup(touchMouseEvent);
    },

    touchmousemoveHandler: function(touchMouseEvent) {
        var containGroup = this.searchContainCursorGroup(touchMouseEvent),
            ownGroup = this.searchOwnCursorGroup(touchMouseEvent);

        if (jQuery.isEmptyObject(containGroup) || jQuery.isEmptyObject(ownGroup)) {
            imMatch.logError("The containGroup is empty: ", containGroup, " or the ownGroup is empty: ", ownGroup);
            return null;
        }

        if (containGroup.id !== ownGroup.id) {
            imMatch.logInfo("[syncGesture.touchmousemoveHandler] Merge the group: " + containGroup.id +
                " with another group: " + ownGroup.id);
            containGroup.add(ownGroup);
            delete imMatch.cursorGroups[ownGroup.id];
        }

        if (jQuery.isEmptyObject(containGroup.cursors[touchMouseEvent.id])) {
            containGroup.add(new imMatch.Cursor(touchMouseEvent));
        }
        else {
            containGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
        }

        return containGroup;
    },

    touchmouseupHandler: function(touchMouseEvent) {
        var group = this.touchmousemoveHandler(touchMouseEvent);

        if (!group.isAllCursorsUp()) {
            return;
        }

        this.tryToStitch(group);

        delete imMatch.cursorGroups[group.id];
    },

    touchmousecancelHandler:function(touchMouseEvent) {
        this.touchmouseupHandler(touchMouseEvent);
    },

    searchOwnCursorGroup: function(touchMouseEvent) {
        var targetGroup;
        jQuery.each(imMatch.cursorGroups, function(groupID, group) {
            if (group.hasOwnPoint(touchMouseEvent)) {
                targetGroup = group;
                return false;
            }
        });

        return targetGroup;
    },

    searchContainCursorGroup: function(touchMouseEvent) {
        var targetGroup, ownGroup;
        jQuery.each(imMatch.cursorGroups, function(groupID, group) {
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
            targetGroup = new imMatch.CursorGroup();
            imMatch.cursorGroups[targetGroup.id] = targetGroup;
        }

        if (jQuery.isEmptyObject(targetGroup.cursors[touchMouseEvent.id])) {
            targetGroup.add(new imMatch.Cursor(touchMouseEvent));
        }
        else {
            targetGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
        }

        return targetGroup;
    },

    tryToStitch: function(group) {
        var stitchingInfo;
        // Pinch Gesture
        // Criteria 0: Only one cursor is in the cursor group
        if (group.numCursors !== 1) {
            imMatch.logDebug("[syncGesture.tryToStitch] The number of cursors is not 1: " + group.numCursors);
            return this;
        }

        // Criteria 1: all of DOWN points is out of the stitching area and UP or CANCEL points is in the stitching area
        if (!group.isAllCurosrsFitStitchingRegionCriteria()) {
            imMatch.logDebug("[syncGesture.tryToStitch] some of cursors do not fit sititching region criteria!");
            return this;
        }

        // Criteria 2: Cursor is straight
        if (!group.isAllCursorsStraight()) {
            imMatch.logDebug("[syncGesture.tryToStitch] some of cursors is not straight!");
            return this;
        }

        // Criteria 3: Cursor is perpendicular to the boundary of window
        if (!group.isAllCursorsPerpendicularToBoundary()) {
            imMatch.logDebug("[syncGesture.tryToStitch] some of cursors is not perpendicular to the boundary of window!");
            return this;
        }

        imMatch.logInfo("[syncGesture.tryToStitch] Try to stitch!");

        stitchingInfo = group.computeStitchingInfo();
        imMatch.socketClient.request.tryToStitch.call(imMatch.socketClient, stitchingInfo);

        imMatch.trigger("trytostitch", stitchingInfo);

        return this;
    }
};