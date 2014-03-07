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
        imMatch.logInfo("[WebSocket.onopen] A websocket opened. URL: " + "@WEBSOCKET_URL " + event);
    };

    this.webSocket.onmessage = function(event) {
        if (jQuery.isEmptyObject(event) || imMatch.isEmpty(event.action)) {
            imMatch.logError("[WebSocket.onmessage] The format of message is wrong! Message: " + event);
            return this;
        }

        imMatch.logInfo("[WebSocket.onmessage] The websocket received message: " + event.data);
        var jsonObject = imMatch.parseJSON(event.data);
        if (self.response[jsonObject.action]) {
            self.response[jsonObject.action](jsonObject);
        }
        else {
            imMatch.logWarn("[imMatch.webSocketServer.on] Unknown json object action: " + jsonObject.action);
        }
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
            imMatch.logError("[SocketClient.send] The format of message is wrong! Message: " + data);
            return this;
        }

        if (this.webSocket.readyState !== window.WebSocket.OPEN) {
            imMatch.logError("[SocketClient.send] WebSocket is not ready. ready state: " + this.webSocket.readyState);
            return this;
        }

        this.webSocket.send(stringify(data));
        return this;
    },

    response: {
        connectionSuccess: function(jsonObject) {
            imMatch.device.id = jsonObject.deviceID;
        },

    /*    synchronize: function(jsonObject) {

        },

        idle: function(jsonObject) {

        },

        stitchStart: function(jsonObject) {

        },

        exchangeData: function(jsonObject) {

        },

        exchangeDataDone: function(jsonObject) {

        },

        unstitchStart: function(jsonObject) {

        },

        unstitchDone: function(jsonObject) {

        }*/
    }
};