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
        alert("The browser does not support WebSocket.");
        window.stop();
        return;
    }

    this.webSocket = new window.WebSocket(@WEBSOCKET_URL);
    this.webSocket.onopen = function(event) {
        if (this.readyState != WebSocket.OPEN) {

        }

        //self.send({action: "connection"});
    };

    this.webSocket.onmessage = function(event) {
    };
                
    this.webSocket.onclose = function(event) {
    };
                
    this.webSocket.onerror = function(event) {
    };
};

imMatch.SocketClient.prototype = {
    send: function(data) {
        if (!data || !data.action) {
            imMatch.logError("[SocketClient.send] The format of message is wrong! Message: " + data);
            return this;
        }

        this.webSocket.send(stringify(data));
        return this;
    }
};

window.socketClient = new imMatch.SocketClient;