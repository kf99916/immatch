/**
 *
 * @class
 * @classdesc The WebSocket server
 * @name ws.Server
 */
jQuery.extend(ws.Server.prototype, {
    /**
     * The stitching groups. Each group shares the sanme virtual space.
     * @default
     * @memberof! ws.Server#
     */
    groups: {},

    /**
     * Caches
     * @default
     * @memberof! ws.Server#
     */
    caches: new imMatch.Cache(),

    /**
     * Adds a new group. "connectionSuccess" message is sent if a new group succedded to be added.
     * @param {Object} webSocket The WebSocket of the device
     * @memberof! ws.Server#
     */
    addGroup: function(webSocket) {
        var group, device;
        if (jQuery.isEmptyObject(webSocket)) {
            imMatch.logWarn("[ws.Server.addGroup] NO webSocket.");
            return this;
        }

        device = new imMatch.Device(webSocket);
        group = new imMatch.Group(device);
        this.groups[group.id] = group;

        device.send({
            action: "connectionSuccess",
            groupID: group.id,
            deviceID: device.id,
            numDevices: group.devices.length
         });

        return group;
    },

    /**
     * Monitor the caches. Remove the dead candidates.
     * @memberof! ws.Server#
     */
    monitorCaches: function() {
        var now = Date.now();
        this.caches.remove("stitchingCandidate", function(candidate) {
            return (Math.abs(now - candidate.timeStamp) > imMatch.lifetimeCandidate);
        });

        setTimeout(this.monitorCaches.bind(this), imMatch.lifetimeCandidate);

        return this;
    },

    /**
     * Adds a new candidate into the cahes.
     * @param {Object} newCandidate The new candidate
     * @memberof! ws.Server#
     */
    addCandidate: function(newCandidate) {
        if (jQuery.isEmptyObject(newCandidate)) {
            return this;
        }

        this.caches.remove("stitchingCandidate", function(candidate) {
            return (newCandidate.groupID === candidate.groupID && newCandidate.deviceID === candidate.deviceID);
        });

        this.caches.queue("stitchingCandidate", newCandidate);

        return this;
    },

    /**
     * Searchs a matched candidate. These two devices will be stitched if found.
     * @param {Object} jsonObject The sitching information
     * @memberof! ws.Server#
     */
    searchMatchCandidate: function(jsonObject) {
        var candidates = this.caches.get("stitchingCandidate"), match;
        if (jQuery.isEmptyObject(jsonObject)) {
            return null;
        }

        jQuery.each(candidates.reverse(), function(i, candidate) {
            if (jsonObject.deviceID !== candidate.deviceID &&
                Math.abs(jsonObject.timeStamp - candidate.timeStamp) < imMatch.lifetimeCandidate) {
                match = candidate;
                return false;
            }
        });

        return match;
    },

    /**
     * Computes a affine transforma for stitching
     * @param {Object} stitchingInfo The sitching information
     * @memberof! ws.Server#
     */
    computeAffineFactor: function(stitchingInfo) {
        stitchingInfo.rad = imMatch.rad(stitchingInfo.orientation, {x: 1, y: 0});
        var rotateTransform = imMatch.AffineTransform.getRotateInstance(stitchingInfo.rad);

        stitchingInfo.margin = rotateTransform.transform(stitchingInfo.margin);
        stitchingInfo.point = rotateTransform.transform(stitchingInfo.point);

        stitchingInfo.translationFactor = {
            x: stitchingInfo.margin.x - stitchingInfo.point.x,
            y: stitchingInfo.margin.y - stitchingInfo.point.y
        };

        delete stitchingInfo.margin;
        delete stitchingInfo.point;
        delete stitchingInfo.orientation;

        return this;
    },

    /**
     * Responses the received message. Here are all the responses:
     * "connection", "close", "error", "tryToStitch", "synchronize", "exchange", and "exchangeDone".
     * @memberof! ws.Server#
     */
    response: {
        connection: function(webSocket) {
            this.addGroup(webSocket);

            return this;
        },

        close: function(event, webSocket) {
            imMatch.logInfo("[ws.Server.response.close] The client closes WebSocket." +
                " deviceID = " + webSocket.deviceID + ", groupID = " + webSocket.groupID + ". Message: " + event.message);

            return this;
        },

        error: function(event, webSocket) {
            jQuery.error("[ws.Server.response.error] WebSocket error. Device: " +
                webSocket.deviceID + ", in group: " + webSocket.groupID + ". Error message: " + event.message);
        },

        tryToStitch: function(jsonObject) {
            var match = this.searchMatchCandidate(jsonObject), group, matchGroup, numDevicesInGroup, numDevicesInMatchGroup;
            if (jQuery.isEmptyObject(match)) {
                this.addCandidate(jsonObject);
                return this;
            }

            group = this.groups[jsonObject.groupID];
            matchGroup = this.groups[match.groupID];

            if (imMatch.isEmpty(group) || imMatch.isEmpty(matchGroup)) {
                imMatch.logError("[ws.Server.tryToStitch] group or matchGroup are empty." +
                        " group:", group, "matchGroup:", matchGroup);
                return this;
            }

            if (!jQuery.isEmptyObject(group.getStitchingInfo()) ||
                !jQuery.isEmptyObject(matchGroup.getStitchingInfo())) {
                imMatch.logDebug("[ws.Server.tryToStitch] Groups are stitching." +
                        " group:", group, "matchGroup:", matchGroup);
                return this;
            }

            // Restitch devices
            if (group.id === matchGroup.id) {
                return this;
            }

            group.numDevicesSynced = {};
            matchGroup.numDevicesSynced = {};

            numDevicesInGroup = group.devices.length;
            numDevicesInMatchGroup = matchGroup.devices.length;

            // Reverse stitch orientation of the later device
            jsonObject.orientation.x = -jsonObject.orientation.x;
            jsonObject.orientation.y = -jsonObject.orientation.y;

            this.computeAffineFactor(jsonObject);
            this.computeAffineFactor(match);

            jsonObject.numExchangedDevices = numDevicesInMatchGroup;
            match.numExchangedDevices = numDevicesInGroup;

            this.caches.queue("stitchingInfo", [jsonObject, match]);
            group.stitch();
            matchGroup.stitch();
        },

        synchronize: function(jsonObject) {
            this.groups[jsonObject.groupID].synchronize(jsonObject);
            return this;
        },

        exchange: function(jsonObject) {
            var toGroup = this.groups[jsonObject.toGroupID];
            if (jQuery.isEmptyObject(toGroup)) {
                return this;
            }

            toGroup.broadcast(jsonObject);
        },

        exchangeDone: function(jsonObject) {
            var group = this.groups[jsonObject.groupID], toGroup = this.groups[jsonObject.toGroupID],
                totalNumDevies = group.devices.length + toGroup.devices.length;

            ++group.numExchangedDoneDevices;
            ++toGroup.numExchangedDoneDevices;
            if (totalNumDevies !== group.numExchangedDoneDevices ||
                totalNumDevies !== toGroup.numExchangedDoneDevices) {
                return this;
            }

            group.numExchangedDoneDevices = 0;

            this.caches.remove("stitchingInfo");

            group.addDevices(toGroup.devices);
            delete this.groups[jsonObject.toGroupID];

            group.broadcast({
                action: "exchangeDone",
                groupID: group.id,
                numDevices: group.devices.length
            });
        }
    }
});

imMatch.logLevel = imMatch.infoLevel;
imMatch.isReady = returnTrue;

imMatch.webSocketServer = new ws.Server({port: 8080, host:null});

imMatch.webSocketServer.on("connection", function(webSocket) {
    var self = this;

    this.response.connection.call(this, webSocket);

    webSocket.on("message", function(event) {
        var jsonObject, response;
        if (jQuery.isEmptyObject(event)) {
            imMatch.logError("[WebSocket.onmessage] The message is empty!");
            return;
        }

        jsonObject = jQuery.parseJSON(event);
        // Normalize timeStamp (Server time)
        jsonObject.timeStamp = Date.now();
        imMatch.logDebug("[WebSocket.onmessage] Action Type: " + jsonObject.action, jsonObject);

        response = self.response[jsonObject.action];
        if (imMatch.isEmpty(response)) {
            imMatch.logWarn("[WebSocket.onmessage] Unknown action: " + jsonObject.action);
            return;
        }

        response.call(self, jsonObject);
    });

    webSocket.on("close", function(event) {
        self.response.close.call(self, event, webSocket);
    });

    webSocket.on("error", function(event) {
        self.response.error.call(self, event, webSocket);
    });
});

// The underlying server emits an error
imMatch.webSocketServer.on("error", function(event) {
    jQuery.error("[imMatch.webSocketServer] WebSocket Server error. error message: " + event.message);
});

imMatch.webSocketServer.monitorCaches();