imMatch.logLevel = imMatch.infoLevel;

imMatch.webSocketServer = new ws.Server({port: 8080, host:null});

jQuery.extend(imMatch.webSocketServer, {
    // Stitching groups: each group shares the same virtual space
    groups: {},

    addGroup: function(webSocket, /* Optional */ deviceID) {
        var group, device;
        if (jQuery.isEmptyObject(webSocket)) {
            imMatch.logWarn("[imMatch.webSocketServer.addGroup] NO webSocket.");
            return this;
        }

        device = new imMatch.Device(webSocket);
        group = new imMatch.Group(device);
        this.groups[group.id] = group;

        device.send({
            action: "connectionSuccess",
            groupID: group.id,
            deviceID: device.id
         });

        return group;
    },

    // Response received messages
    response: {
        connection: function(webSocket) {
            imMatch.webSocketServer.addGroup(webSocket);

            return this;
        },

        close: function(event, webSocket) {
            imMatch.logInfo("[imMatch.Group.response.close] The client closes WebSocket." +
                " deviceID = " + webSocket.deviceID + ", groupID = " + webSocket.groupID + ". Message: " + event.message);

            //this.groups[webSocket.groupID].removeDeviceWithID(webSocket.deviceID);

            return this;
        },

        error: function(event, webSocket) {
            jQuery.error("[imMatch.Group.response.error] WebSocket error. Device: " +
                webSocket.deviceID + ", in group: " + webSocket.groupID + ". Error message: " + event.message);
        }
    }
});

imMatch.webSocketServer.on("connection", function(webSocket) {
    var response = this.response;

    response.connection(webSocket);

    webSocket.on("message", function(event) {
        if (jQuery.isEmptyObject(event)) {
            imMatch.logError("[WebSocket.onmessage] The message is empty!");
            return;
        }

        var jsonObject = jQuery.parseJSON(event);
        imMatch.logInfo("[WebSocket.onmessage] The websocket received a message: ", jsonObject);

        if (imMatch.isEmpty(response[jsonObject.action])) {
            imMatch.logWarn("[WebSocket.onmessage] Unknown action: " + jsonObject.action);
            return;
        }

        response[jsonObject.action](jsonObject);
    });

    webSocket.on("close", function(event) {
        response.close(event, webSocket);
    });

    webSocket.on("error", function(event) {
        response.error(event, webSocket);
    });
});

// The underlying server emits an error
imMatch.webSocketServer.on("error", function(event) {
    jQuery.error("[imMatch.webSocketServer] WebSocket Server error. error message: " + event.message);
});