imMatch.Cache = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cache) ) {
        return new imMatch.Cache();
    }
};

imMatch.Cache.prototype = {
    queue: function(type, data, cmp) {
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(data)) {
            return this;
        }

        this[type] = this[type] || [];
        this[type].push(data);

        if (!jQuery.isFunction(cmp)) {
            return this;
        }

        this[type].sort(cmp);
        return this;
    },

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

    get: function(type, cmp) {
        var results = [];
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return results;
        }

        if (jQuery.isFunction(cmp)) {
            return this[type];
        }

        jQuery.each(this[type], function(i, data) {
            if (cmp(data)) {
                results.push(data);
            }
        });

        return results;
    },

    getNRemove: function(type, cmp) {
        var results = [];
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return results;
        }

        if (!jQuery.isFunction(cmp)) {
            imMatch.swap(results, this[type]);
            delete this[type];
            return results;
        }

        jQuery.each(this[type], function(i, data) {
            if (cmp(data)) {
                results.push(data);
            }
        });

        imMatch.swap(results, this[type]);
        return results;
    },

    remove: function(type, cmp) {
        var removeItems = [], remainingItems = [];
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return removeItems;
        }

        if (!jQuery.isFunction(cmp)) {
            imMatch.swap(removeItems, this[type]);
            delete this[type];
            return removeItems;
        }

        jQuery.each(this[type], function(i, data) {
            if (cmp(data)) {
                removeItems.push(data);
            }
            else {
                remainingItems.push(data);
            }
        });

        imMatch.swap(remainingItems, this[type]);
        return removeItems;
    }
};