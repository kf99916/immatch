/**
 * Cache
 * @class
 */

/**
 * Creates a cache to store data from the WebSocket server.
 * @constructor
 */
imMatch.Cache = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cache) ) {
        return new imMatch.Cache();
    }
};

imMatch.Cache.prototype = {
    /**
     * Queues data into the cache assigned type. the cache can be sorted by the compare function.
     * @param {String} type The category data is stored
     * @param {Object} data Stored data
     * @param {Function} cmp A compare function (Optional).
     * @returns {Cache} Result The cache
     */
    queue: function(type, data, cmp) {
        if (imMatch.isEmpty(type) || imMatch.isEmpty(data)) {
            return this;
        }

        this[type] = this[type] || [];
        push.call(this[type], data);

        if (!jQuery.isFunction(cmp)) {
            return this;
        }

        this[type].sort(cmp);
        return this;
    },

    /**
     * Dequeues data from the cache assigned type. data is removed from the cache.
     * @param {String} type The category data is dequeued
     * @returns {Object} Result Data
     */
    dequeue: function(type) {
        var result = {};
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return result;
        }

        result = this[type].shift();
        if (imMatch.isEmpty(result)) {
            delete this[type];
        }

        return result;
    },

    /**
     * Gets data which fit the compare function from the cache assigned type.
     * If no compare function, then get all of data in the cache assigned type.
     * @param {String} type The category data is got
     * @param {Function} cmp A compare function (Optional).
     * @returns {Array} Result Matched data
     */
    get: function(type, cmp) {
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return [];
        }

        if (!jQuery.isFunction(cmp)) {
            return this[type];
        }

        return jQuery.grep(this[type], cmp);
    },

    /**
     * Gets data which fit the compare function from the cache assigned type and remove them.
     * If no compare function, then gets all of data in the cache assigned type.
     * @param {String} type The category data is got
     * @param {Function} cmp A compare function (Optional).
     * @returns {Array} Result Matched data
     */
    getNRemove: function(type, cmp) {
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return [];
        }

        return this.remove(type, cmp);
    },

    /**
     * Removes data which fit the compare function from the cache assigned type.
     * If no compare function, then removes all of data in the cache assigned type.
     * @param {String} type The category data is removed
     * @param {Function} cmp A compare function (Optional).
     * @returns {Array} Result Matched data
     */
    remove: function(type, cmp) {
        var removeItems = [];
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return removeItems;
        }

        if (!jQuery.isFunction(cmp)) {
            jQuery.extend(removeItems, this[type]);
            delete this[type];
            return removeItems;
        }

        removeItems = jQuery.grep(this[type], cmp);
        this[type] = jQuery.grep(this[type], cmp, true);
        return removeItems;
    }
};