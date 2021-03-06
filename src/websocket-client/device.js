/**
 * Defines size and resolution specification of the known devices.
 * @readonly
 * @constant
 * @default
 * @namespace
 */
imMatch.deviceHelper = {
    MacBookPro: function() {
        return {ppi: 113,
                margin: {top: 0.7, bottom: 0.7, left: 0.7, right: 0.7}
        };
    },

    iPhone: function() {
        return {ppi: 163,
                margin: {top: (4.5 - 480 / 163) / 2, bottom: (4.5 - 480 / 163) / 2,
                        left: (2.31 - 320 / 163) / 2, right: (2.31 - 320 / 163) / 2}
        };
    },

    iPhone5: function() {
        return {ppi: 163,
                margin: {top: (4.87 - 1136 / 326) / 2, bottom: (4.87 - 1136 / 326) / 2,
                        left: (2.31 - 640 / 326) / 2, right: (2.31 - 640 / 326) / 2}
        };
    },

    iPad: function() {
        return {ppi: 132,
                margin: {top: (9.5 - 1024 / 132) / 2, bottom: (9.5 - 1024 / 132) / 2,
                        left: (7.31 - 768 / 132) / 2, right: (7.31 - 768 / 132) / 2}
        };
    }
};

jQuery.extend(MobileEsp, {
    DetectIphone5: function() {
        if (!MobileEsp.DetectIphoneOrIpod()) {
            return false;
        }

        return (window.screen.availHeight > 480);
    }
});

/**
 * The current device
 * @namespace
 */
imMatch.device = imMatch.deviceHelper.MacBookPro();
if (MobileEsp.DetectIphone5()) {
    imMatch.device = imMatch.deviceHelper.iPhone5();
}
else if (MobileEsp.DetectIphoneOrIpod()) {
    imMatch.device = imMatch.deviceHelper.iPhone();
}
else if (MobileEsp.DetectIpad()) {
    imMatch.device = imMatch.deviceHelper.iPad();
}

jQuery.extend(imMatch.device, {
    /**
     * @readonly
     * @constant
     * @default window.devicePixelRatio || 1
     * @memberof! imMatch.device#
     */
    devicePixelRatio: window.devicePixelRatio || 1,

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch.device#
     */
    stitchingRegionSize: 0.3,

    /**
     * Set a given group ID to imMatch.device
     * @param {String} groupID A groupID generated by the WebSocket server. It fits UUID format.
     * @memberof! imMatch.device#
     */
    setGroupID: function(groupID) {
        var self = this;
        this.groupID = groupID || 0;
        jQuery.each(imMatch.scenes, function(i, scene) {
            scene.groupID = self.groupID;
        });

        return this;
    }
});