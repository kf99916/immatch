var DEBUG = 0x00,
    INFO = 0x01,
    WARN = 0x02,
    ERROR = 0x04;

function fixMessage(message, mode) {
    return "[" + mode.toUpperCase() + "] " + Date() + " : " + message;
}

window.console = window.console || {};
window.console.log = console.log || function(message) {return message;};
window.console.debug = console.debug || function(message) {window.console.log(message);};
window.console.info = console.info || function(message) {window.console.log(message);};
window.console.warn = console.warn || function(message) {window.console.log(message);};
window.console.error = console.error || function(message) {window.console.log(message);};

jQuery.extend(imMatch, {
    logDebug: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > DEBUG) {
            return this;
        }

        window.console.debug(fixMessage(message, "DEBUG"));

        return this;
    },

    logInfo: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > INFO) {
            return this;
        }

        window.console.info(fixMessage(message, "INFO"));

        return this;
    },

    logWarn: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > WARN) {
            return this;
        }

        window.console.warn(fixMessage(message, "WARN"));

        return this;
    },

    logError: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > ERROR) {
            return this;
        }

        window.console.error(fixMessage(message, "ERROR"));

        return this;
    },

    allLogLevels: {
        debug: DEBUG,
        info: INFO,
        warn: WARN,
        error: ERROR
    },

    logLevel: ERROR
});
