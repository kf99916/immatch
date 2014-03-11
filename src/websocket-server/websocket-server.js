jQuery.extend(ws.Server.prototype, {
    // Stitching groups: each group shares the same virtual space
    groups: {},

    caches: new imMatch.Cache(),

    addGroup: function(webSocket, /* Optional */ deviceID) {
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
            numDevices: group.numDevices
         });

        return group;
    },

    monitorCaches: function() {
        var now = Date.now();
        this.caches.remove("stitchingCandidate", function(candidate, i) {
            return (Math.abs(now - candidate.timestamp) > imMatch.lifetimeCandidate);
        });

        setTimeout(this.monitorCaches.bind(this), imMatch.lifetimeCandidate);

        return this;
    },

    addCandidate: function(newCandidate) {
        if (jQuery.isEmptyObject(newCandidate)) {
            return this;
        }

        this.caches.remove("stitchingCandidate", function(candidate, i) {
            return (newCandidate.groupID == candidate.groupID && newCandidate.deviceID == candidate.deviceID);
        });

        this.caches.queue("stitchingCandidate", newCandidate);

        return this;
    },

    searchMatchCandidate: function(jsonObject) {
        var candidates = this.caches.get("stitchingCandidate"), now = Date.now(), match;
        if (jQuery.isEmptyObject(jsonObject)) {
            return null;
        }

        jQuery.each(candidates.reverse(), function(i, candidate) {
            if (jsonObject.deviceID != candidate.deviceID &&
                Math.abs(now - candidate.timestamp) < imMatch.lifetimeCandidate) {
                match = candidate;
                return false;
            }
        });

        return match;
    },

    // Response received messages
    response: {
        connection: function(webSocket) {
            this.addGroup(webSocket);

            return this;
        },

        close: function(event, webSocket) {
            imMatch.logInfo("[ws.Server.response.close] The client closes WebSocket." +
                " deviceID = " + webSocket.deviceID + ", groupID = " + webSocket.groupID + ". Message: " + event.message);

            //this.groups[webSocket.groupID].removeDeviceWithID(webSocket.deviceID);

            return this;
        },

        error: function(event, webSocket) {
            jQuery.error("[ws.Server.response.error] WebSocket error. Device: " +
                webSocket.deviceID + ", in group: " + webSocket.groupID + ". Error message: " + event.message);
        },

        tryToStitch: function(jsonObject) {
            var match = this.searchMatchCandidate(jsonObject), group, matchGroup;
            if (jQuery.isEmptyObject(match)) {
                this.addCandidate(jsonObject);
                return this;
            }

            group = this.groups[jsonObject.groupID];
            matchGroup = this.groups[match.groupID];

            if (!jQuery.isEmptyObject(group.getStitchingInfo()) ||
                !jQuery.isEmptyObject(matchGroup.getStitchingInfo())) {
                imMatch.logDebug("[ws.Server.tryToStitch] Groups are stitching." +
                        " group:", group, "matchGroup:", matchGroup);
                return this;
            }

            // Restitch devices
            if (group.id == matchGroup.id) {
                return this;
            }

            // Reverse stitch orientation of the later device
            jsonObject.orientation.x = -jsonObject.orientation.x;
            jsonObject.orientation.y = -jsonObject.orientation.y;

            this.caches.queue("stitchingInfo", [jsonObject, match]);
            if (group.numDevices === 1 && matchGroup.numDevices === 1) {
                group.stitch();
                matchGroup.stitch();
            }
        },

        synchronize: function(jsonObject) {
            this.groups[jsonObject.groupID].synchronize(jsonObject);
            return this;
        }
    }
});

imMatch.logLevel = imMatch.infoLevel;

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
        imMatch.logInfo("[WebSocket.onmessage] The websocket received a message: ", jsonObject);

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