var Mode = {
    ALONE: 0,
    STITCHED: 1
};

imMatch.engine = {
    interval: 0,

    mode: Mode.ALONE,

    lastRunTimestamp: 0,

    frame: 0, // Be reset if there is no any touchMouseEvent in cache. Please check it in geture-recognizer.js
    
    run: function(timestamp) {
        var stamp = {
            time: timestamp,
            frame: this.frame
        };

        imMatch.trigger("gestureWillbeRecognized", stamp);
        if (this.frame == 0 || imMatch.gestureRecognizer.recognize(stamp) != 0) {
            imMatch.trigger("gestureDidbeRecognized", stamp);

            imMatch.trigger("contextWillbeDrawn", stamp);
            imMatch.canvas.draw(stamp);
            imMatch.trigger("contextDidbeDrawn", stamp);
        }

        this.updateInterval(stamp);
        this.lastRunTimestamp = timestamp;
        ++this.frame;

        switch(this.mode) {
            case Mode.STITCHED:
                setTimeout(this.run.bind(this), this.interval, Date.now() + this.interval);
            break;
            case Mode.ALONE: default:
                window.requestAnimationFrame(this.run.bind(this));
            break;
        }
    },

    updateInterval: function(stamp) {
        switch(imMatch.engine.mode) {
            case Mode.STITCHED:
            // TODO
            break;
            case Mode.ALONE: default:
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

        imMatch.socketClient = new imMatch.SocketClient;
        imMatch.canvas = new imMatch.CanvasAdapter(canvasID);

        imMatch.addTouchMouseHandlers();

        imMatch.engine.lastRunTimestamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimestamp);
    }
});