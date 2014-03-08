window.console = window.console || {};
window.console.log = console.log || function() {return arguments;};
window.console.debug = console.debug || function() {window.console.log.apply(window.console, arguments);};
window.console.info = console.info || function() {window.console.log.apply(window.console, arguments);};
window.console.warn = console.warn || function() {window.console.log.apply(window.console, arguments);};
window.console.error = console.error || function() {window.console.log.apply(window.console, arguments);};

jQuery.extend(imMatch, {
    debugLevel: 0,

    infoLevel: 1,

    warnLevel: 2,

    errorLevel: 3,

    logDebug: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.debugLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("DEBUG"));

        window.console.debug.apply(window.console, arguments);

        return this;
    },

    logInfo: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.infoLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("INFO"));

        window.console.info.apply(window.console, arguments);

        return this;
    },

    logWarn: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.warnLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("WARN"));

        window.console.warn.apply(window.console, arguments);

        return this;
    },

    logError: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.errorLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("ERROR"));

        window.console.error.apply(window.console, arguments);

        return this;
    },

    logLevel: imMatch.errorLevel
});
