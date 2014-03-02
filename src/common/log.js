window.console = window.console || {};
window.console.log = console.log || function(message) {return message;};
window.console.debug = console.debug || function(message) {window.console.log(message);};
window.console.info = console.info || function(message) {window.console.log(message);};
window.console.warn = console.warn || function(message) {window.console.log(message);};
window.console.error = console.error || function(message) {window.console.log(message);};

jQuery.extend(imMatch, {
    debugLevel: 0,

    infoLevel: 1,

    warnLevel: 2,

    errorLevel: 3,
    
    logDebug: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > imMatch.debugLevel) {
            return this;
        }

        window.console.debug(fixMessage(message, "DEBUG"));

        return this;
    },

    logInfo: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > imMatch.infoLevel) {
            return this;
        }

        window.console.info(fixMessage(message, "INFO"));

        return this;
    },

    logWarn: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > imMatch.warnLevel) {
            return this;
        }

        window.console.warn(fixMessage(message, "WARN"));

        return this;
    },

    logError: function(message) {
        if (imMatch.isEmpty(message) || this.logLevel > imMatch.errorLevel) {
            return this;
        }

        window.console.error(fixMessage(message, "ERROR"));

        return this;
    },

    logLevel: imMatch.errorLevel
});
