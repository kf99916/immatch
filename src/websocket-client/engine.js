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

        imMatch.trigger("contextWillbeDrawn", stamp);

        imMatch.canvas.clear();
        imMatch.trigger("contextDraw", stamp);

        imMatch.trigger("contextDidbeDrawn", stamp);

        this.updateInterval(stamp);
        this.lastRunTimestamp = timestamp;
        ++this.frame;

        switch(this.mode) {
            case Mode.STITCHED:
                setTimeout(this.run, this.interval, Date.now() + this.interval);
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
        imMatch.socketClient = new imMatch.SocketClient;
        imMatch.canvas = new imMatch.CanvasAdapter(canvasID);

        imMatch.addTouchMouseHandlers();
        imMatch.on("contextWillbeDrawn", imMatch.gestureRecognizer.contextWillbeDrawnHandler);

        imMatch.engine.lastRunTimestamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimestamp);
    }
});