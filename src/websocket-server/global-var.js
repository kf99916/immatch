window.WebSocket = window.WebSocket || {};
window.WebSocket.OPEN = window.WebSocket.OPEN || 1;

jQuery.extend(imMatch, {
    /**
     * THe life time of candidates. A candidate means the device is possible to be stitched with the other device.
     * @constant
     * @default
     * @memberof! imMatch#
     */
    lifetimeCandidate: 2000
});