/**
 * Manages imMatch SDK client.
 * @namespace
 */
imMatch.engine = {
    /**
     * Returns true if the engine is ready to run; otherwise, false.
     */
    isReady: returnFalse,

    /**
     * The current mode. It could be alone, stitching.exchange, stitching.donw, stitching.wait, or stitched.
     */
    mode: imMatch.mode.alone,

    frame: 0,

    /**
     * Returns true if there is a sprite wants to tween; otherwise, false.
     */
    tweened: returnFalse,

    /**
     * Returns true if there is a touch or mouse event; otherwise, false.
     */
    touched: returnFalse,

    /**
     * imMatch.socketClient.request
     * @readonly
     * @constant
     * @default
     */
    request: null,

    /**
     * imMatch.socketClient.caches
     * @readonly
     * @constant
     * @default
     */
    caches: null,

    debugPanel: null,

    /**
     * Determines whether the debug panel is showed or not.
     * @returns {Boolean} Result True if imMatch.logLevel is equal or smaller than infoLevel; otherwise, false
     */
    isShowDebugInfo: function() {
        return (imMatch.logLevel <= imMatch.infoLevel);
    },

    /**
     * Creates a debug panel with debugPanelID
     * @param {String} debugPanelID A ID for a debug panel
     * @returns {Object} Result A debug panel with debugOanelID
     */
    createDebugPanel: function(debugPanelID) {
        this.debugPanel = jQuery("<div>", {id: debugPanelID}).appendTo("body");
        this.debugPanel.offset({top: 10, left: 10});
        this.debugPanel.width(200).css({
            "font-size": 10,
            "background-color": "#E5E4E2"
        });
        return this.debugPanel;
    },

    /**
     * Updates inforamtion in the debug panel
     */
    updateDebugPanel: function() {
        this.debugPanel.empty();
        this.debugPanel.append("<b>Device ID</b>: " + imMatch.device.id + "<br>");
        this.debugPanel.append("<b>Group</b>: " + imMatch.device.groupID + "<br>");
        this.debugPanel.append("<b>#Devices</b>: " + imMatch.device.numDevices + "<br>");
        this.debugPanel.append("<b>#Scenes</b>: " + imMatch.scenes.length + "<br>");
        this.debugPanel.append("<b>Mode</b>: 0x" + this.mode.toString(16) + "<br>");
        this.debugPanel.append("<b>Frame</b>: " + this.frame + "<br>");
        this.debugPanel.append("<b>Ready</b>: " + this.isReady() + "<br>");
        this.debugPanel.append("<b>Web Socket Status</b>: " + imMatch.socketClient.webSocket.readyState + "<br>");
        this.debugPanel.append("<b>Position</b>: (" +
            imMatch.viewport.x.toFixed(5) + ", " + imMatch.viewport.y.toFixed(5) + ")<br>");
        this.debugPanel.append("<b>Width </b>: " + imMatch.viewport.width.toFixed(5) + " inches<br>");
        this.debugPanel.append("<b>Height </b>: " + imMatch.viewport.height.toFixed(5) + " inches<br>");
        this.debugPanel.append("<b>Angle </b>: " + (imMatch.viewport.rad * 180 / Math.PI).toFixed(5) + " degrees<br>");

        var self = this;
        jQuery.each(imMatch.scenes, function(i, scene) {
            if (scene.viewportID === imMatch.viewport.id) {
                self.debugPanel.append("<u><b>Scene </b>(" + scene.id + ") : (" + scene.x.toFixed(5) + ", " + scene.y.toFixed(5) +
                    ", " + scene.z.toFixed(5) + " ) " + scene.rad.toFixed(5) + "</u><br>");
            }
            else {
                self.debugPanel.append("<b>Scene </b>(" + scene.id + ") : (" + scene.x.toFixed(5) + ", " + scene.y.toFixed(5) +
                    ", " + scene.z.toFixed(5) + " ) " + scene.rad.toFixed(5) + "<br>");
            }

            jQuery.each(scene.sprites, function(j, sprite) {
                self.debugPanel.append("<b>Sprite </b>(" + sprite.id + ") : (" + sprite.x.toFixed(5) +
                    ", " + sprite.y.toFixed(5) + ", " + sprite.z.toFixed(5) + " )<br>");
            });
        });
        return this;
    },

    /**
     * Runloop which the timer is controlled by window.requestAnimationFrame. Stops if exceptions are catched.
     * @param {float} timestamp Milliseconds elapsed since 1 January 1970 00:00:00 UTC
     */
    run: function(timeStamp) {
        try {
            this.updateMode();

            var self = this,
                stamp = {
                time: timeStamp,
                frame: this.frame,
                chunk: Math.floor(this.frame / imMatch.chunkSize) * imMatch.chunkSize};

            if (this.isShowDebugInfo()) {
                this.updateDebugPanel();
            }

            this.updateReady(stamp);
            this.runWithMode(stamp);

            window.requestAnimationFrame(function() {
                self.run(Date.now());
            });
        }
        catch(error) {
            imMatch.logError("Exception! Error Message: ", error);
            window.alert("Exception! Error Message: " + error);
            window.stop();
        }
    },

    /**
     * Sets the current mode. The engine triggers a "modechange" event if the current mode is successful to be set.
     * @param {imMatch.mode} newMode The new mode is set
     */
    setMode: function(newMode) {
        if (imMatch.isEmpty(newMode)) {
            return this;
        }

        this.mode = newMode;
        imMatch.trigger("modechange", newMode);
        return this;
    },

    /**
     * Updates the current mode.
     */
    updateMode: function() {
        var stitchingInfo;
        switch(this.mode) {
            case imMatch.mode.alone:
                stitchingInfo = this.caches.get("stitchingInfo")[0];
                if (!jQuery.isEmptyObject(stitchingInfo)) {
                    this.setMode(imMatch.mode.stitching.exchange);
                }
            break;
            case imMatch.mode.stitching.exchange:
                this.caches.remove("synchronizeDoneInfo");
                this.caches.remove("syncTouchMouseEvent");

                stitchingInfo = this.caches.get("stitchingInfo")[0];
                this.updateTransformableObjAffineTransform(stitchingInfo[0]);
                this.exchange(stitchingInfo[1]);
                this.setMode(imMatch.mode.stitching.done);
            break;
            case imMatch.mode.stitching.done:
                stitchingInfo = this.caches.get("stitchingInfo")[0];

                if (imMatch.device.numExchangedDevices === stitchingInfo[0].numExchangedDevices) {
                    this.request.exchangeDone.call(imMatch.socketClient, {toGroupID: stitchingInfo[1].groupID});
                    this.setMode(imMatch.mode.stitching.wait);
                }
            break;
            case imMatch.mode.stitching.wait:
                var exchangeDoneInfo = this.caches.get("exchangeDoneInfo")[0];
                if (exchangeDoneInfo === imMatch.device.numDevices) {
                    this.caches.remove("exchangeDoneInfo");
                    this.caches.remove("stitchingInfo");

                    imMatch.device.numExchangedDevices = 0;
                    this.frame = 0;
                    this.setMode(imMatch.mode.stitched);
                }
            break;
            case imMatch.mode.stitched:
                stitchingInfo = this.caches.get("stitchingInfo")[0];
                if (!jQuery.isEmptyObject(stitchingInfo)) {
                    this.setMode(imMatch.mode.stitching.exchange);
                }
            break;
            default:
            break;
        }
        return this;
    },

    /**
     * Updates imMatch.engine.isReady
     */
    updateReady: function(stamp) {
        var synchronizeDoneInfo = -1;
        switch(imMatch.getMainMode(this.mode)) {
            case imMatch.mainMode.alone:
                this.isReady = returnTrue;
            break;
            case imMatch.mainMode.stitching:
                this.isReady = returnFalse;
            break;
            case imMatch.mainMode.stitched:
                this.isReady = returnFalse;
                if (this.frame % imMatch.chunkSize !== imMatch.chunkSize - 1) {
                    this.isReady = returnTrue;
                }
                else {
                    synchronizeDoneInfo = this.caches.get("synchronizeDoneInfo")[0];
                    if (synchronizeDoneInfo === stamp.chunk + imMatch.chunkSize) {
                        this.caches.remove("synchronizeDoneInfo");
                        this.isReady = returnTrue;
                    }
                }
            break;
            default:
            break;
        }

        return this;
    },

    /**
     * Runs according to the current mode.
     */
    runWithMode: function(stamp) {
        var touchedSprites;
        if (!this.isReady()) {
            return this;
        }

        if (this.synced()) {
            this.request.synchronize.call(imMatch.socketClient, stamp);
        }

        touchedSprites = imMatch.gestureRecognizer.recognize(stamp);
        this.touched = (touchedSprites.length !== 0)? returnTrue : returnFalse;

        if (this.reDrawn()) {
            imMatch.canvas.draw();
        }

        ++this.frame;

        return this;
    },

    /**
     * Determines whether the client needs to be synced with the WebSocket server.
     * @returns {Boolean} Result True if the client needs to be synced with the WebSocket server; otherwise, false
     */
    synced: function() {
        return (imMatch.getMainMode(this.mode) === imMatch.mainMode.stitched && this.frame % imMatch.chunkSize === 0);
    },

    /**
     * Determines whether the client needs to be redrawn.
     * @returns {Boolean} Result True if the client needs to be redrawn; otherwise, false
     */
    reDrawn: function() {
        return (this.frame === 0 || this.touched() || this.tweened());
    },

    /**
     * Updates affine transform of all the transformable objects in the device group according to the stitching information.
     * @param {Object} stitchingInfo The stitching information
     */
    updateTransformableObjAffineTransform: function(stitchingInfo) {
        imMatch.viewport.rotate(stitchingInfo.rad);
        imMatch.viewport.translate(stitchingInfo.translationFactor);

        jQuery.each(imMatch.scenes, function(i, scene) {
            // The stitched and updated scenes have been added before this function invoked
            if (scene.groupID !== imMatch.device.groupID) {
                return;
            }

            scene.rotate(stitchingInfo.rad);
            scene.translate(stitchingInfo.translationFactor);
        });

        return this;
    },

    /**
     * Exchanges all the transformable objects in the current viewport with the stitching device group
     * @param {Object} stitchingInfo The stitching information
     */
    exchange: function(stitchingInfo) {
        var exchangeScenes = [];
        jQuery.each(imMatch.scenes, function(i, scene) {
            if (scene.viewportID !== imMatch.viewport.id) {
                return;
            }

            push.call(exchangeScenes, scene);
        });

        this.request.exchange.call(imMatch.socketClient, {
            toGroupID: stitchingInfo.groupID,
            scenes: exchangeScenes
        });
    },

    /**
     * Adds transformable objects from the exchanged data of the stitching device group
     * @param {Object} jsonObject The exchanged data of the stitching device group
     */
    addTransformableObjects: function(jsonObject) {
        jQuery.each(jsonObject.scenes, function(i, serializedScene) {
            var scene = new imMatch.Scene(false);
            scene.deserialize(serializedScene);
            imMatch.addScene(scene);
        });

        ++imMatch.device.numDevices;
    }
};

jQuery.extend(imMatch, {
    /**
     * Invokes the function and then imMatch.engine starts to execute its task.
     * @param {String} canvasID The canvas ID. If the canvas does not exist, imMatch.CanvasAdapter will create it.
     * @param {String} webSocketServerIP WebSocket server IP. The default value is "127.0.0.1".
     * @memberof! imMatch#
     */
    run: function(canvasID, webSocketServerIP) {
        var debugPanelID = "debugPanel", webSocketServerURL;
        if (!imMatch.isReady()) {
            jQuery.error("Please invoke $im.ready(fn).");
        }

        webSocketServerIP = webSocketServerIP || "127.0.0.1";
        webSocketServerURL = "ws://" + webSocketServerIP + ":8080";

        imMatch.socketClient = new imMatch.SocketClient(webSocketServerURL);
        imMatch.engine.request = imMatch.socketClient.request;
        imMatch.engine.caches = imMatch.socketClient.caches;

        imMatch.canvas = new imMatch.CanvasAdapter(canvasID);

        imMatch.addTouchMouseHandlers();

        if (imMatch.engine.isShowDebugInfo()) {
            imMatch.engine.debugPanel = document.getElementById(debugPanelID);
            if (jQuery.isEmptyObject(imMatch.engine.debugPanel)) {
                imMatch.engine.createDebugPanel(debugPanelID);
            }
        }

        imMatch.engine.run(Date.now());
    }
});