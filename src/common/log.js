window.console = window.console || {};
window.console.log = console.log || function() {return arguments;};
window.console.debug = console.debug || function() {window.console.log.apply(window.console, arguments);};
window.console.info = console.info || function() {window.console.log.apply(window.console, arguments);};
window.console.warn = console.warn || function() {window.console.log.apply(window.console, arguments);};
window.console.error = console.error || function() {window.console.log.apply(window.console, arguments);};

jQuery.extend(imMatch, {
    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    debugLevel: 0,

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    infoLevel: 1,

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    warnLevel: 2,

    /**
     * @readonly
     * @constant
     * @default
     * @memberof! imMatch#
     */
    errorLevel: 3,

    /**
     * Logs messages which log level is not larger than debugLevel
     * @memberof! imMatch#
     */
    logDebug: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.debugLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("DEBUG"));

        window.console.debug.apply(window.console, arguments);

        return this;
    },

    /**
     * Logs messages which log level is not larger than infoLevel
     * @memberof! imMatch#
     */
    logInfo: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.infoLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("INFO"));

        window.console.info.apply(window.console, arguments);

        return this;
    },

    /**
     * Logs messages which log level is not larger than warnLevel
     * @memberof! imMatch#
     */
    logWarn: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.warnLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("WARN"));

        window.console.warn.apply(window.console, arguments);

        return this;
    },

    /**
     * Logs messages which log level is not larger than errorLevel
     * @memberof! imMatch#
     */
    logError: function() {
        if (arguments.length === 0 || this.logLevel > imMatch.errorLevel) {
            return this;
        }

        unshift.call(arguments, generatePrefixMessage("ERROR"));

        window.console.error.apply(window.console, arguments);

        return this;
    },

    /**
     * The current log level
     * @memberof! imMatch#
     */
    logLevel: imMatch.errorLevel
});
