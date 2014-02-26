var Mode = {
    ALONE: 0,
    STITCHED: 1
};

imMatch.engine = {
    interval: 0,

    canvasAdapter: null,

    mode: Mode.ALONE,

    lastRunTimestamp: 0,
    
    run: function(timestamp) {
        imMatch.trigger("contextWillbeDrawn");

        this.canvasAdapter.clear();
        imMatch.trigger("contextDraw");

        imMatch.trigger("contextDidbeDrawn");

        this.updateInterval(timestamp);
        this.lastRunTimestamp = timestamp;
        switch(imMatch.engine.mode) {
            case Mode.STITCHED:
                setTimeout(this.run, this.interval, Date.now() + this.interval);
            break;
            case Mode.ALONE: default:
                window.requestAnimFrame(imMatch.engine.run);
            break;
        }
    },

    updateInterval: function(timestamp) {
        switch(imMatch.engine.mode) {
            case Mode.STITCHED:
            break;
            case Mode.ALONE: default:
                this.interval = timestamp - lastRunTimestamp;
            break;
        }
    }
};

imMatch.extend({
    run: function(canvasID) {
        imMatch.engine.canvasAdapter = new imMatch.CanvasAdapter(canvasID);
        imMatch.engine.lastRunTimestamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimestamp);
    }
});