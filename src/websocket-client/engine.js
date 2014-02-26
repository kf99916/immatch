var Mode = {
    ALONE: 0,
    STITCHED: 1
};

imMatch.engine = {
    interval: 0,

    canvasAdapter: null,

    mode: Mode.ALONE,

    lastRunTimestamp: 0,

    frame: 0,
    
    run: function(timestamp) {
        var stamp = {
            time: timestamp,
            frame: this.frame
        };

        imMatch.trigger("contextWillbeDrawn", stamp);

        this.canvasAdapter.clear();
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
    },

    addScene: function(scene) {
        if (jQuery.isEmptyObject(scene)) {
            imMatch.logError("[imMatch.engine.addScene] Scene is empty.");
            return this;
        }

        imMatch.scenes.push(scene);
        imMatch.scenes.sort(function(a, b) {
            return b.z - a.z;
        });
    }
};

jQuery.extend(imMatch, {
    run: function(canvasID) {
        imMatch.engine.canvasAdapter = new imMatch.CanvasAdapter(canvasID);
        imMatch.engine.lastRunTimestamp = Date.now();
        imMatch.engine.run(imMatch.engine.lastRunTimestamp);
    }
});