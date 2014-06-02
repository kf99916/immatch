/**
 * Creates a Device object.
 * @class
 * @classdesc Device represents a device.
 * @constructor
 * @param {Object} webSocet The WebSocket of the device
 */
imMatch.Device = function(webSocket) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Device) ) {
        return new imMatch.Device(webSocket);
    }

    this.id = Math.uuidFast();
    this.webSocket = webSocket;
};

imMatch.Device.prototype = {
    /**
     * Sends a given data to the device.
     * @param {Object} data The request data
     */
    send: function(data) {
        if (jQuery.isEmptyObject(data) || imMatch.isEmpty(data.action)) {
            imMatch.logError("[imMatch.Device.send] The format of message is wrong! Message: ", data);
            return this;
        }

        if (this.webSocket.readyState !== window.WebSocket.OPEN) {
            imMatch.logError("[imMatch.Device.send] WebSocket is not ready. ready state: " + this.webSocket.readyState);
            return this;
        }

        try {
            this.webSocket.send(stringify.call(this, data));
        } catch(error) {
            imMatch.error("[imMatch.Group.addGroup] WEbSocket failed to send message. Error Message: " + error.message);
        }

        return this;
    }
};

/**
 * Creates a Group object.
 * @class
 * @classdesc All the devices in the same group are synchronized with the touchMouseEvent.
 * @constructor
 * @param {Object} devices The devnces
 */
imMatch.Group = function(devices) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Group) ) {
        return new imMatch.Group(devices);
    }

    this.id = Math.uuidFast();
    this.devices = [];
    this.numExchangedDoneDevices = 0;
    this.numDevicesSynced = {};
    this.addDevices(devices);
};

imMatch.Group.prototype = {
    /**
     * Adds devices into the group.
     * @param {Object} devices The devnces
     */
    addDevices: function(devices) {
        if (jQuery.isEmptyObject(devices)) {
            return this;
        }

        if(!jQuery.isArray(devices)) {
            devices = [devices];
        }

        push.apply(this.devices, devices);

        return this;
    },

    /**
     * Synchronizes all the devices in the group.
     * The group send "synchronizeDone" message if all the devices are synchronized in the chunk.
     * @param {Object} jsonObject The data needs to be synchronized
     */
    synchronize: function(jsonObject) {
        if (jQuery.isEmptyObject(jsonObject)) {
            return this;
        }

        this.broadcast(jsonObject);

        if (imMatch.isEmpty(this.numDevicesSynced[jsonObject.chunk])) {
            this.numDevicesSynced[jsonObject.chunk] = 0;
        }

        ++this.numDevicesSynced[jsonObject.chunk];
        if (this.numDevicesSynced[jsonObject.chunk] !== this.devices.length) {
            return this;
        }

        delete this.numDevicesSynced[jsonObject.chunk];
        if (this.stitch()) {
            return this;
        }

        this.broadcast({
            action: "synchronizeDone",
            chunk: jsonObject.chunk
        });
        return this;
    },

    /**
     * Broadcasts messgaes to all the devices in the group.
     * @param {Object} data The request data
     */
    broadcast: function(data) {
        if (jQuery.isEmptyObject(data)) {
            return this;
        }

        jQuery.each(this.devices, function(i, device) {
            device.send(data);
        });

        return this;
    },

    /**
     * Gets the group's stitching information.
     * @returns {Object} Result The group's stitching information
     */
    getStitchingInfo: function() {
        var self = this, stitchingInfos = imMatch.webSocketServer.caches.get("stitchingInfo"), result;
        jQuery.each(stitchingInfos, function(i, stitchingInfo) {
            if (self.id === stitchingInfo[0].groupID || self.id === stitchingInfo[1].groupID) {
                result = stitchingInfo;
                return false;
            }
        });

        return result;
    },

    /**
     * Sends the stitching information.
     * @returns {Boolean} True if the stitching information succedded to be sent; otherwise, false
     */
    stitch: function() {
        var stitchingInfo = this.getStitchingInfo();
        if (jQuery.isEmptyObject(stitchingInfo)) {
            return false;
        }

        if (this.id === stitchingInfo[1].groupID) {
            stitchingInfo = stitchingInfo.reverse();
        }

        this.broadcast({
            action: "stitching",
            stitchingInfo: stitchingInfo
        });

        imMatch.logInfo("[imMatch.Group.stitch][device1]", stitchingInfo[0], "[device2]", stitchingInfo[1]);

        return true;
    }
};