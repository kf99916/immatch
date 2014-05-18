imMatch.engine = {
    isReady: returnFalse,

    interval: 0,

    mode: imMatch.mode.alone,

    lastRunTimeStamp: 0,

    frame: 0, // TODO: Reset

    tweened: returnFalse,

    touched: returnFalse,

    // imMatch.socketClient.request
    request: null,

    // imMatch.socketClient.caches
    caches: null,

    debugPanel: null,

    isShowDebugInfo: function() {
        return (imMatch.logLevel <= imMatch.infoLevel);
    },

    createDebugPanel: function(debugPanelID) {
        this.debugPanel = jQuery("<div>", {id: debugPanelID}).appendTo("body");
        this.debugPanel.offset({top: 10, left: 10});
        this.debugPanel.width(200).css({
            "font-size": 10,
            "background-color": "#E5E4E2"
        });
        return this.debugPanel;
    },

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
            self.debugPanel.append("<b>Scene </b>(" + scene.id + ") : (" + scene.x.toFixed(5) + ", " + scene.y.toFixed(5) +
                ", " + scene.z.toFixed(5) + " ) " + scene.rad.toFixed(5) + "<br>");
            jQuery.each(scene.sprites, function(j, sprite) {
                self.debugPanel.append("<b>Sprite </b>(" + sprite.id + ") : (" + sprite.x.toFixed(5) +
                    ", " + sprite.y.toFixed(5) + ", " + sprite.z.toFixed(5) + " )<br>");
            });
        });
        return this;
    },

    run: function(timeStamp) {
        try {
            this.updateMode();

            var stamp = {
                time: timeStamp,
                frame: this.frame,
                chunk: Math.floor(this.frame / imMatch.chunkSize) * imMatch.chunkSize};

            if (this.isShowDebugInfo()) {
                this.updateDebugPanel();
            }

            this.updateReady(stamp);
            this.runWithMode(stamp);
            this.updateIntervalWithMode(stamp);
            this.setTimerWithMode(stamp);
        }
        catch(error) {
            imMatch.logError("Exception! Error Message: ", error);
            window.alert("Exception! Error Message: " + error);
            window.stop();
        }
    },

    updateMode: function() {
        var stitchingInfo;
        switch(this.mode) {
            case imMatch.mode.alone:
                stitchingInfo = this.caches.get("stitchingInfo")[0];
                if (!jQuery.isEmptyObject(stitchingInfo)) {
                    this.mode = imMatch.mode.stitching.exchange;
                }
            break;
            case imMatch.mode.stitching.exchange:
                stitchingInfo = this.caches.get("stitchingInfo")[0];
                this.updateViewportAffineTransform(stitchingInfo[1]);
                this.exchange(stitchingInfo);
                this.mode = imMatch.mode.stitching.done;
            break;
            case imMatch.mode.stitching.done:
                stitchingInfo = this.caches.get("stitchingInfo")[0];

                if (imMatch.device.numExchangedDevices === stitchingInfo[0].numExchangedDevices) {
                    this.request.exchangeDone.call(imMatch.socketClient, {toGroupID: stitchingInfo[1].groupID});
                    this.mode = imMatch.mode.stitching.wait;
                }
            break;
            case imMatch.mode.stitching.wait:
                var exchangeDoneInfo = this.caches.get("exchangeDoneInfo")[0];
                if (exchangeDoneInfo === imMatch.device.numDevices) {
                    this.caches.remove("exchangeDoneInfo");
                    this.caches.remove("stitchingInfo");

                    imMatch.device.numExchangedDevices = 0;
                    this.frame = 0;
                    this.mode = imMatch.mode.stitched;
                }
            break;
            case imMatch.mode.stitched:
            break;
            default:
            break;
        }
        return this;
    },

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

    runWithMode: function(stamp) {
        var touchedSprites;
        if (!this.isReady()) {
            return this;
        }

        if (this.synced()) {
            imMatch.trigger("infoWillSynchronized", stamp);
            this.request.synchronize.call(imMatch.socketClient, stamp);
            imMatch.trigger("infoDidSynchronized", stamp);
        }

        imMatch.trigger("gestureWillRecognized", stamp);
        touchedSprites = imMatch.gestureRecognizer.recognize(stamp);
        this.touched = (touchedSprites.length !== 0)? returnTrue : returnFalse;
        imMatch.trigger("gestureDidRecognized", stamp);

        if (this.reDrawn()) {
            imMatch.trigger("contextWillDrawn", stamp);
            imMatch.canvas.draw();
            imMatch.trigger("contextDidDrawn", stamp);
        }
        ++this.frame;

        return this;
    },

    updateIntervalWithMode: function(stamp) {
        switch(imMatch.getMainMode(this.mode)) {
            case imMatch.mainMode.alone:
            case imMatch.mainMode.stitching:
                this.interval = stamp.time - this.lastRunTimeStamp;
            break;
            case imMatch.mainMode.stitched:
            // TODO
                this.interval = stamp.time - this.lastRunTimeStamp;
            break;
            default:
                this.interval = stamp.time - this.lastRunTimeStamp;
            break;
        }

        this.lastRunTimestamp = stamp.time;
        return this;
    },

    setTimerWithMode: function() {
        var self = this;
        switch(imMatch.getMainMode(this.mode)) {
            case imMatch.mainMode.alone:
            case imMatch.mainMode.stitching:
                window.requestAnimationFrame(function() {
                    self.run(Date.now());
                });
            break;
            case imMatch.mainMode.stitched:
              /*  setTimeout(function() {
                    self.run();
                }, this.interval, Date.now() + this.interval);*/
                window.requestAnimationFrame(function() {
                    self.run(Date.now());
                });
            break;
            default:
                window.requestAnimationFrame(function() {
                    self.run(Date.now());
                });
            break;
        }

        return this;
    },

    synced: function() {
        return (imMatch.getMainMode(this.mode) === imMatch.mainMode.stitched && this.frame % imMatch.chunkSize === 0);
    },

    reDrawn: function() {
        return (this.frame === 0 || this.touched() || this.tweened());
    },

    updateViewportAffineTransform: function(stitchingInfo) {
        var rad = stitchingInfo.radBetweenUnitAndOri - imMatch.viewport.rad,
            translationFactor = {
                x: stitchingInfo.point.x + stitchingInfo.margin.x,
                y: stitchingInfo.point.y + stitchingInfo.margin.y
            };

        imMatch.viewport.rotate(rad);
        imMatch.viewport.translate(translationFactor);

        jQuery.each(imMatch.scenes, function(i, scene) {
            // The stitched and updated scenes have been added before this function invoked
            if (scene.viewportID !== imMatch.viewport.id) {
                return;
            }

            scene.rotate(rad);
            scene.translate(translationFactor);

            jQuery.each(scene.sprites, function(j, sprite) {
                sprite.rotate(rad);
            });
        });

        return this;
    },

    exchange: function(stitchingInfo) {
        var exchangeScenes = [];
        jQuery.each(imMatch.scenes, function(i, scene) {
            if (scene.viewportID !== imMatch.viewport.id) {
                return;
            }

            push.call(exchangeScenes, scene);
        });

        this.request.exchange.call(imMatch.socketClient, {
            toGroupID: stitchingInfo[1].groupID,
            scenes: exchangeScenes
        });
    },

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
    run: function(canvasID) {
        var debugPanelID = "debugPanel";
        if (!imMatch.isReady()) {
            jQuery.error("Please invoke $im.ready(fn).");
        }

        imMatch.socketClient = new imMatch.SocketClient();
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

        imMatch.engine.lastRunTimeStamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimeStamp);
    }
});