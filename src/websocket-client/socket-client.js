imMatch.SocketClient = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.SocketClient) ) {
        return new imMatch.SocketClient();
    }
    var self = this;

    // Connection
    // For Firefox
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        window.alert("The browser does not support WebSocket.");
        window.stop();
        return;
    }

    this.caches = new imMatch.Cache();
    this.webSocket = new window.WebSocket("@WEBSOCKET_URL");
    this.webSocket.onopen = function(event) {
        imMatch.logInfo("[WebSocket.onopen] A websocket opened. URL: " + "@WEBSOCKET_URL ", event);
    };

    this.webSocket.onmessage = function(event) {
        var jsonObject, response;
        if (jQuery.isEmptyObject(event)) {
            imMatch.logError("[WebSocket.onmessage] The message is empty!");
            return;
        }

        jsonObject = jQuery.parseJSON(event.data);
        imMatch.logDebug("[WebSocket.onmessage] Action Type: " + jsonObject.action, jsonObject);

        response = self.response[jsonObject.action];
        if (imMatch.isEmpty(response)) {
            imMatch.logWarn("[WebSocket.onmessage] Unknown action: " + jsonObject.action);
            return;
        }

        response.call(self, jsonObject);
    };

    this.webSocket.onclose = function(event) {
        imMatch.logWarn("[WebSocket.onclose] A websocket closed. code: " +
            event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean);
    };

    this.webSocket.onerror = function(event) {
        imMatch.logError("[WebSocket.onerror] " + event.message);
        imMatch.error("[WebSocket.onerror] Socket error.");
    };
};

imMatch.SocketClient.prototype = {
    send: function(data) {
        if (jQuery.isEmptyObject(data) || imMatch.isEmpty(data.action)) {
            imMatch.logError("[SocketClient.send] The format of message is wrong! Message: ", data);
            return this;
        }

        if (this.webSocket.readyState !== window.WebSocket.OPEN) {
            imMatch.logError("[SocketClient.send] WebSocket is not ready. ready state: " + this.webSocket.readyState);
            return this;
        }

        this.webSocket.send(stringify(data));
        return this;
    },

    fixRequestData: function(data, action) {
        data.action = action;
        data.deviceID = imMatch.device.id;
        data.groupID = imMatch.device.groupID;
        data.timestamp = Date.now();
        return data;
    },

    fixSynchronizData: function(data) {
        // The data is received before the next chunk.
        data.chunk += imMatch.chunkSize;
        data.touchMouseEvents = this.caches.getNRemove("touchMouseEvent");
        // The touchMouseEvents are executed after 2 chunks.
        jQuery.each(data.touchMouseEvents, function(i, touchMouseEvent) {
            touchMouseEvent.frame += 2 * imMatch.chunkSize;
        });

        return data;
    },

    request: {
        tryToStitch: function(data) {
            this.send(this.fixRequestData(data, "tryToStitch"));
            imMatch.logInfo("[SocketClient.request.tryToStitch] data:", data);
        },

        synchronize: function(data) {
            data = this.fixSynchronizData(data);
            this.send(this.fixRequestData(data, "synchronize"));
            imMatch.logDebug("[SocketClient.request.synchronize] data:", data);
        },

        exchange: function(data) {
            this.send(this.fixRequestData(data, "exchange"));
            imMatch.logInfo("[SocketClient.request.exchange] data:", data);
        },

        exchangeDone: function(data) {
            this.send(this.fixRequestData(data, "exchangeDone"));
            imMatch.logInfo("[SocketClient.request.exchangeDone] data:", data);
        }
    },

    response: {
        connectionSuccess: function(jsonObject) {
            imMatch.device.id = jsonObject.deviceID;
            imMatch.device.groupID = jsonObject.groupID;
            imMatch.device.numDevices = jsonObject.numDevices;
            imMatch.device.numExchangedDevices = 0;
            return this;
        },

        synchronize: function(jsonObject) {
            var self = this;
            jQuery.each(jsonObject.touchMouseEvents, function(i, touchMouseEvent) {
                self.caches.queue("syncTouchMouseEvent", touchMouseEvent, function(a, b) {
                    return a.order - b.order;
                });
            });

            return this;
        },

        synchronizeDone: function(jsonObject) {
            this.caches.queue("synchronizeDoneInfo", jsonObject.chunk);
            return this;
        },

        stitching: function(jsonObject) {
            if (!jQuery.isEmptyObject(this.caches.get("stitchingInfo"))) {
                return this;
            }

            this.caches.queue("stitchingInfo", jsonObject.stitchingInfo);
            return this;
        },

        exchange: function(jsonObject) {
            ++imMatch.device.numExchangedDevices;
            imMatch.engine.addTransformableObjects(jsonObject);
        },

        exchangeDone: function(jsonObject) {
            imMatch.device.groupID = jsonObject.groupID;
            this.caches.queue("exchangeDoneInfo", jsonObject.numDevices);
            return this;
        }
    }
};