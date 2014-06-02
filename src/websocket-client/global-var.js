/**
 * Global variables
 * @module Global Variables
 */
    /**
     * Records the order of touch events.
     * It is reset if there is no any touchMouseEvent in cache.
     * @see imMatch.gestureRecognizer
     * @global
     */
var touchOrder = 0,

    /**
     * Records the z-order of scenes.
     * It is reset if there is no any scene.
     * @see imMatch.scene
     * @global
     */
    sceneZ = 0;

jQuery.extend(imMatch, {
    /**
     * Creates a value for mode according thg main mode and state
     * @param {Int} mainMode The main mode
     * @param {Int} state State
     * @returns {Int} Result The mode which consists of the main mode and state
     * @private
     * @memberof! imMatch#
     */
    makeMode: function(mainMode, state) {
        mainMode = mainMode || 0;
        state = state || 0;
        return (mainMode << 24) | (state & 0xffff);
    },

    /**
     * Returns the main mode
     * @param {Int} mode The mode
     * @returns {Int} Result The main mode
     * @memberof! imMatch#
     */
    getMainMode: function(mode) {
        mode = mode || 0;
        return (mode >> 24);
    },

    /**
     * Returns the statue
     * @param {Int} mode The mode
     * @returns {Int} Result The state
     * @memberof! imMatch#
     */
    getState: function(mode) {
        mode = mode || 0;
        return (mode & 0xffff);
    },

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    mainMode: {
        alone: 0x01,
        stitching: 0x02,
        stitched: 0x04
    },

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    state: {
        exchange: 1,
        done: 2,
        wait: 3
    },

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    coordinate: {
        local: 0,
        global: 1,
        scene: 2,
        sprite: 3
    },

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    chunkSize: 5
});

/**
 * @readonly
 * @constant
 * @default
 * @memberof! imMatch#
 */
imMatch.mode = {
    alone: imMatch.makeMode(imMatch.mainMode.alone),

    stitching: {
            exchange: imMatch.makeMode(imMatch.mainMode.stitching, imMatch.state.exchange),
            done: imMatch.makeMode(imMatch.mainMode.stitching, imMatch.state.done),
            wait: imMatch.makeMode(imMatch.mainMode.stitching, imMatch.state.wait)
    },

    stitched: imMatch.makeMode(imMatch.mainMode.stitched)
};