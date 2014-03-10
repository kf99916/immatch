imMatch.engine = {
    interval: 0,

    mode: imMatch.mode.alone,

    lastRunTimestamp: 0,

    frame: 0, // TODO: Reset

    isReady: function() {
        if (this.mode !== imMatch.mode.stitched) {
            return true;
        }

        // TODO
    },

    run: function(timestamp) {
        var stamp = {
                time: timestamp,
                frame: this.frame,
                chunk: Math.floor(this.frame / imMatch.chunkSize) * imMatch.chunkSize},
            touchedSprites;

        if (this.isReady()) {
            if (this.mode === imMatch.mode.stitched && this.frame % imMatch.chunkSize === 0) {
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

            this.updateInterval(stamp);
            this.lastRunTimestamp = timestamp;
            ++this.frame;
        }

        switch(this.mode) {
            case imMatch.mode.stitched:
                setTimeout(this.run.bind(this), this.interval, Date.now() + this.interval);
            break;
            case imMatch.mode.alone:
                window.requestAnimationFrame(this.run.bind(this));
            break;
            default:
                window.requestAnimationFrame(this.run.bind(this));
            break;
        }
    },

    updateInterval: function(stamp) {
        switch(this.mode) {
            case imMatch.mode.stitched:
            // TODO
            break;
            case imMatch.mode.alone:
                this.interval = stamp.time - this.lastRunTimestamp;
            break;
            default:
                this.interval = stamp.time - this.lastRunTimestamp;
            break;
        }
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