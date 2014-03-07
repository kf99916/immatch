jQuery.extend(imMatch, {
    mode: {
        alone: 0,
        stitched: 1
    },

    run: function(canvasID) {
        if (!imMatch.isReady()) {
            jQuery.error("Please invoke $im.ready(fn).");
        }

        imMatch.socketClient = new imMatch.SocketClient();
        imMatch.canvas = new imMatch.CanvasAdapter(canvasID);

        imMatch.addTouchMouseHandlers();

        imMatch.engine.lastRunTimestamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimestamp);
    }
});

imMatch.engine = {
    interval: 0,

    mode: imMatch.mode.alone,

    lastRunTimestamp: 0,

    frame: 0, // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js

    run: function(timestamp) {
        var stamp = {
            time: timestamp,
            frame: this.frame
        };

        imMatch.trigger("gestureWillbeRecognized", stamp);
        if (this.frame === 0 || imMatch.gestureRecognizer.recognize(stamp).length !== 0) {
            imMatch.trigger("gestureDidbeRecognized", stamp);

            imMatch.trigger("contextWillbeDrawn", stamp);
            imMatch.canvas.draw();
            imMatch.trigger("contextDidbeDrawn", stamp);
        }

        this.updateInterval(stamp);
        this.lastRunTimestamp = timestamp;
        ++this.frame;

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