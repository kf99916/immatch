imMatch.Device = function(webSocket) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Device) ) {
        return new imMatch.Device(webSocket);
    }

    this.id = Math.uuidFast();
    this.webSocket = webSocket;
};

imMatch.Device.prototype = {
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

imMatch.Group = function(devices) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Group) ) {
        return new imMatch.Group(devices);
    }

    this.id = Math.uuidFast();
    this.devices = {};
    this.numDevices = 0;
    this.numDevicesSynced = {};
    this.addDevices(devices);
};

imMatch.Group.prototype = {
    addDevices: function(devices) {
        var self = this;
        if (jQuery.isEmptyObject(devices)) {
            return this;
        }

        if(!jQuery.isArray(devices)) {
            devices = [devices];
        }

        jQuery.each(devices, function(i, device) {
            device.group = self;
            self.devices[device.id] = device;
            ++self.numDevices;
        });

        return this;
    },

    synchronize: function(jsonObject) {
        if (jQuery.isEmptyObject(jsonObject)) {
            return this;
        }

        this.broadcast(jsonObject);

        if (imMatch.isEmpty(this.numDevicesSynced[jsonObject.chunk])) {
            this.numDevicesSynced[jsonObject.chunk] = 0;
        }

        ++this.numDevicesSynced[jsonObject.chunk];
        if (this.numDevicesSynced[jsonObject.chunk] !== this.numDevices) {
            return this;
        }

        return this.stitch();
    },

    // Send data to all devices in the group
    broadcast: function(data) {
        if (jQuery.isEmptyObject(data)) {
            return this;
        }

        jQuery.each(this.devices, function(id, device) {
            device.send(data);
        });

        return this;
    },

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

    stitch: function() {
        var stitchingInfo = this.getStitchingInfo();
        if (jQuery.isEmptyObject(stitchingInfo)) {
            return this;
        }

        if (this.id === stitchingInfo[1].groupID) {
            stitchingInfo = stitchingInfo.reverse();
        }

        this.broadcast({
            action: "stitching",
            stitchingInfo: stitchingInfo
        });

        imMatch.logInfo("[imMatch.Group.stitch][device1]", stitchingInfo[0], "[device2]", stitchingInfo[1]);

        return this;
    }
};