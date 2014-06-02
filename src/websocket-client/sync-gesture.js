jQuery.extend(imMatch, {
    /**
     * Defines some threadshold about the synchronized gesutres.
     * @private
     * @constant
     * @default
     * @memberof! imMatch#
     */
    threadsholdAboutSyncGesture: {
        distance: 2,
        samplingTime: 50, // ms
        straight: Math.PI / 20,
        perpendicularRadDiff: 0.2
    }
});

/**
 * Recognizes the synchronized gesutres.
 * @namespace
 */
imMatch.syncGesture = {
    /**
     * The current cursor groups for the synchronized gesure
     * @memberof! imMatch#
     */
    cursorGroups: {},

    /**
     * Recognizes the touchMouseEvent.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    recognize: function(touchMouseEvent) {
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return;
        }

        this[handler](touchMouseEvent);
    },

    /**
     * Recognizes the touchMouseEvent which the toch or mouse is down.
     * Adds it into cursor groups or creates the new cursor group contained it.
     * @param {Object} touchMouseEvent The touchMouseEvent
     * @returns {Object} Result The target cursor group
     */
    touchmousedownHandler: function(touchMouseEvent) {
        return this.addCursorGroup(touchMouseEvent);
    },

    /**
     * Recognizes the touchMouseEvent which the toch or mouse is moving.
     * Adds it into cursor groups according to the touchMouseEvent ID.
     * @param {Object} touchMouseEvent The touchMouseEvent
     * @returns {Object} Result The target cursor group
     */
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
            delete this.cursorGroups[ownGroup.id];
        }

        if (jQuery.isEmptyObject(containGroup.cursors[touchMouseEvent.id])) {
            containGroup.add(new imMatch.Cursor(touchMouseEvent));
        }
        else {
            containGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
        }

        return containGroup;
    },

    /**
     * Recognizes the touchMouseEvent which the toch or mouse is up.
     * Tries to stitch the device if all of the cursors in the cursor group is up.
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    touchmouseupHandler: function(touchMouseEvent) {
        var group = this.touchmousemoveHandler(touchMouseEvent);

        if (!group.isAllCursorsUp()) {
            return;
        }

        this.tryToStitch(group);

        delete this.cursorGroups[group.id];
    },

    /**
     * Recognizes the touchMouseEvent which the toch or mouse is cancelled.
     * Action is the same as touchmouseupHandler.
     * @see imMatch.syncGesture.touchmouseupHandler
     * @param {Object} touchMouseEvent The touchMouseEvent
     */
    touchmousecancelHandler:function(touchMouseEvent) {
        this.touchmouseupHandler(touchMouseEvent);
    },

    /**
     * Searchs the cursor group owns the touchMouseEvent.
     * "Own" means the touchMouseEvent exactly is in the cursor group.
     * @param {Object} touchMouseEvent The touchMouseEvent
     * @returns {Object} Result The target cursor group
     */
    searchOwnCursorGroup: function(touchMouseEvent) {
        var targetGroup;
        jQuery.each(this.cursorGroups, function(groupID, group) {
            if (group.hasOwnPoint(touchMouseEvent)) {
                targetGroup = group;
                return false;
            }
        });

        return targetGroup;
    },

    /**
     * Searchs the cursor group contains the touchMouseEvent.
     * "Contain" means the touchMouseEvent is enough closed to the cursor group.
     * @param {Object} touchMouseEvent The touchMouseEvent
     * @returns {Object} Result The target cursor group
     */
    searchContainCursorGroup: function(touchMouseEvent) {
        var targetGroup, ownGroup;
        jQuery.each(this.cursorGroups, function(groupID, group) {
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

    /**
     * Adds the cursor group into imMatch.syncGesture.cursorGroups.
     * @param {Object} touchMouseEvent The touchMouseEvent
     * @returns {Object} Result The target cursor group
     */
    addCursorGroup: function(touchMouseEvent) {
        var targetGroup = this.searchContainCursorGroup(touchMouseEvent);
        if (!targetGroup) {
            targetGroup = new imMatch.CursorGroup();
            this.cursorGroups[targetGroup.id] = targetGroup;
        }

        if (jQuery.isEmptyObject(targetGroup.cursors[touchMouseEvent.id])) {
            targetGroup.add(new imMatch.Cursor(touchMouseEvent));
        }
        else {
            targetGroup.cursors[touchMouseEvent.id].add(touchMouseEvent);
        }

        return targetGroup;
    },

    /**
     * Tries to stitch the device. "trytostitch" request is sent if the following criteria of Pinch Gesture are fit: <br>
     * 1. Only one cursor is in the cursor group. <br>
     * 2. All the cursors in the cursor group fit stitching region criteria. <br>
     * 3. Cursor is enough straight. <br>
     * 4. Cursor is enough perpendicular to the boundary of the device.
     * @see imMatch.CursorGroup#isAllCurosrsFitStitchingRegionCriteria
     * @see imMatch.CursorGroup#isAllCursorsStraight
     * @see imMatch.CursorGroup#isAllCursorsPerpendicularToBoundary
     * @param {Object} group The target cursor group
     */
    tryToStitch: function(group) {
        var stitchingInfo;
        // Pinch Gesture
        // Criteria 1: Only one cursor is in the cursor group.
        if (group.numCursors !== 1) {
            imMatch.logDebug("[syncGesture.tryToStitch] The number of cursors is not 1: " + group.numCursors);
            return this;
        }

        // Criteria 2: All the cursors in the cursor group fit stitching region criteria.
        if (!group.isAllCurosrsFitStitchingRegionCriteria()) {
            imMatch.logDebug("[syncGesture.tryToStitch] some of cursors do not fit sititching region criteria!");
            return this;
        }

        // Criteria 3: Cursor is enough straight.
        if (!group.isAllCursorsStraight()) {
            imMatch.logDebug("[syncGesture.tryToStitch] some of cursors is not straight!");
            return this;
        }

        // Criteria 4: Cursor is enough perpendicular to the boundary of the device
        if (!group.isAllCursorsPerpendicularToBoundary()) {
            imMatch.logDebug("[syncGesture.tryToStitch] some of cursors is not perpendicular to the boundary of window!");
            return this;
        }

        imMatch.logInfo("[syncGesture.tryToStitch] Try to stitch!");

        stitchingInfo = group.computeStitchingInfo();
        imMatch.socketClient.request.tryToStitch.call(imMatch.socketClient, stitchingInfo);

        /**
         * @name imMatch#trytostitch
         * @event
         * @param {Object} stitchingInfo Stitching Information
         */
        imMatch.trigger("trytostitch", stitchingInfo);

        return this;
    }
};