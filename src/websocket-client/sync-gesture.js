jQuery.extend(imMatch, {
    threadsholdAboutSyncGesture: {
        distance: 2,
        smaplingTime: 50, // ms
        straight: Math.PI / 20
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
            imMatch.logError("The containGroup is empty: " + containGroup + " or the ownGroup is empty: " + ownGroup);
            return null;
        }

        if (containGroup.id !== ownGroup.id) {
            imMatch.logInfo("[syncGesture.touchmousemoveHandler] Merge the group: " + containGroup.id +
                " with another group: " + ownGroup.id);
            containGroup.add(ownGroup);
            delete imMatch.cursorGroups[ownGroup.id];
        }

        containGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);

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
        // Criteria 1: all of DOWN points is out of the stitching area and UP or CANCEL points is in the stitching area
        if (!group.isAllCurosrsFitStitchingRegionCriteria()) {
            imMatch.logDebug("[syncGesture.tryToStitch] All of cursors do not fit sititching region criteria!");
            return this;
        }

        // Criteria 2: Cursor is straight
        if (!group.isAllCursorsStraight()) {
            imMatch.logDebug("[syncGesture.tryToStitch] All of cursors is not straight!");
            return this;
        }

        // Criteria 3: Cursor is perpendicular to the boundary of window

        imMatch.logInfo("[syncGesture.tryToStitch] Try to stitch!");
        return this;
    }
};