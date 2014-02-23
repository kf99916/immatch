imMatch.SocketClient = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.SocketClient) ) {
        return new imMatch.SocketClient();
    }

    // Connection
    // For Firefox 
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        alert("The browser does not support WebSocket.");
        window.stop();
        return;
    }

    this.webSocket = new window.WebSocket(@WEBSOCKET_URL, @WEBSOCKET_PROTOCOLS);
    this.webSocket.onopen = function(event) {
    };

    this.webSocket.onmessage = function(event) {
    };
                
    this.webSocket.onclose = function(event) {
    };
                
    this.webSocket.onerror = function(event) {
    };
};