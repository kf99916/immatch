imMatch.engine = {
    interval: 0,

    mode: imMatch.mode.alone,

    lastRunTimestamp: 0,

    frame: 0, // TODO: Reset

    numDevices: 0,

    numDevicesSynced: {},

    run: function(timestamp) {
        var stamp = {
                time: timestamp,
                frame: this.frame,
                chunk: Math.floor(this.frame / imMatch.chunkSize) * imMatch.chunkSize};

        this.updateMode(stamp);
        this.runWithMode(stamp);
        this.updateIntervalWithMode(stamp);
        this.setTimerWithMode(stamp);
    },

    updateMode: function() {
        switch(this.mode) {
            case imMatch.mode.alone:
                if (!jQuery.isEmptyObject(imMatch.socketClient.caches.get("stitchingInfo"))) {
                    this.mode = imMatch.mode.stitching.exchange;
                }
            break;
            case imMatch.mode.stitching.exchange:
                this.updateViewportAffineTransform(imMatch.socketClient.caches.getNRemove("stitchingInfo")[0]);
                this.sendAllData();
                this.mode = imMatch.mode.stitching.done;
            break;
            case imMatch.mode.stitching.done:
            break;
            case imMatch.mode.stitching.wait:
            break;
            case imMatch.mode.stitched:
            break;
            default:
            break;
        }
        return this;
    },

    runWithMode: function(stamp) {
        var ready = false, mainMode = imMatch.getMainMode(this.mode), touchedSprites;
        switch(mainMode) {
            case imMatch.mainMode.alone:
                ready = true;
            break;
            case imMatch.mainMode.stitching:
                ready = false;
            break;
            case imMatch.mainMode.stitched:
                if (this.numDevices === this.numDevicesSynced[stamp.chunk + imMatch.chunkSize]) {
                    ready = true;
                }
            break;
            default:
            break;
        }

        if (!ready) {
            return this;
        }

        if (mainMode === imMatch.mainMode.stitched && this.frame % imMatch.chunkSize === 0) {
            imMatch.trigger("infoWillSynchronized", stamp);
            this.synchronize.call(imMatch.socketClient, stamp);
            imMatch.trigger("infoDidSynchronized", stamp);
        }

        imMatch.trigger("gestureWillRecognized", stamp);
        touchedSprites = imMatch.gestureRecognizer.recognize(stamp);
        imMatch.trigger("gestureDidRecognized", stamp);

        if (this.frame === 0 || touchedSprites.length !== 0) {
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
                this.interval = stamp.time - this.lastRunTimestamp;
            break;
            case imMatch.mainMode.stitched:
            // TODO
            break;
            default:
                this.interval = stamp.time - this.lastRunTimestamp;
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
                    self.run();
                });
            break;
            case imMatch.mainMode.stitched:
                setTimeout(function() {
                    self.run();
                }, this.interval, Date.now() + this.interval);
            break;
            default:
                window.requestAnimationFrame(function() {
                    self.run();
                });
            break;
        }

        return this;
    },

    updateViewportAffineTransform: function(stitchingInfo) {
        var rad = imMatch.rad(stitchingInfo[0].orientation, {x: 1, y: 0}),
            affineTransform = imMatch.AffineTransform.getRotateInstance(rad),
            margin = affineTransform.transform(stitchingInfo[0].margin),
            point = affineTransform.transform(stitchingInfo[0].point);

        affineTransform.preConcatenate(imMatch.AffineTransform.getTranslationInstance({
            x: point.x + margin.x,
            y: point.y + margin.y
        }));

        imMatch.viewport.affineTransform.preConcatenate(affineTransform);

        return this;
    },

    sendAllData: function() {

    }
};

jQuery.extend(imMatch, {
    run: function(canvasID) {
        if (!imMatch.isReady()) {
            jQuery.error("Please invoke $im.ready(fn).");
        }

        imMatch.socketClient = new imMatch.SocketClient();
        imMatch.engine.synchronize = imMatch.socketClient.request.synchronize;
        imMatch.canvas = new imMatch.CanvasAdapter(canvasID);

        imMatch.addTouchMouseHandlers();

        imMatch.engine.lastRunTimestamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimestamp);
    }
});