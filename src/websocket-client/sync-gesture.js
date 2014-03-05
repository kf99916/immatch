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
        this.addCursorGroup(touchMouseEvent);
    },

    touchmousemoveHandler: function(touchMouseEvent) {
        var containGroup = this.searchContainCursorGroup(touchMouseEvent),
            ownGroup = this.searchOwnCursorGroup(touchMouseEvent);

        if (jQuery.isEmptyObject(containGroup) || jQuery.isEmptyObject(ownGroup)) {
            imMatch.logError("The containGroup is empty: " + containGroup + " or the ownGroup is empty: " + ownGroup);
            return;
        }

        if (containGroup.id != ownGroup.id) {
            imMatch.logInfo("[syncGesture.touchmousemoveHandler] Merge the group: " + containGroup.id + 
                " with another group: " + ownGroup.id);
            containGroup.add(ownGroup);
            delete imMatch.cursorGroups[ownGroup.id];
        }

        containGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
    },

    touchmouseupHandler: function(touchMouseEvent) {
        var group = this.searchContainCursorGroup(touchMouseEvent);
        this.touchmousemoveHandler(touchMouseEvent);

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
            targetGroup = new imMatch.CursorGroup;
            imMatch.cursorGroups[targetGroup.id] = targetGroup;
        }

        if (jQuery.isEmptyObject(targetGroup.cursors[touchMouseEvent.id])) {
            targetGroup.add(new imMatch.Cursor(touchMouseEvent));
        }
        else {
            targetGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
        }

        return this;
    },

    tryToStitch: function(group) {
        // Criteria 1: Cursor is straight
        if (!group.isAllCursorsStraight()) {
            imMatch.logDebug("[syncGesture.tryToStitch] All of cursors is not straight!");
            return;   
        }

        // Criteria 2: Start touch is out of the stitching region and End touch is in the stitching region

        // Criteria 3: Cursor is perpendicular to the boundary of window

        imMatch.logInfo("[syncGesture.tryToStitch] Try to stitch!");
    }
};