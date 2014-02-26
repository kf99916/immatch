imMatch.Cache = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cache) ) {
        return new imMatch.Cache();
    }
};

imMatch.Cache.prototype = {
    queue: function(type, data) {
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(data)) {
            imMatch.logError("[imMatch.Cache.queue] Type is null: " + type + " or data is empty: " + data);
            return this;
        }

        this[type] = this[type] || [];
        this[type].push(data);
        return this;
    },

    dequeue: function(type) {
        var result;
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            imMatch.logError("[imMatch.Cache.dequeue] Type is null: " + type + " or the cache is empty: " + this[type]);
            return null;
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
            imMatch.logError("[imMatch.Cache.get] Type is null: " + type + " or the cache is empty: " + this[type]);
            return null;
        }

        if (imMatch.isEmpty(cmp)) {
            return this[type];
        }

        jQuery.each(this[type], function(i, data) {
            if (cmp(data)) {
                results.push(data);
            }
        });

        return results;
    },

    remove: function(type, cmp) {
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            imMatch.logError("[imMatch.Cache.remove] Type is null: " + type + " or the cache is empty: " + this[type]);
            return this;
        }

        if (imMatch.isEmpty(cmp)) {
            delete this[type];
            return this;
        }

        this[type] = jQuery.grep(this[type], function(data) {
            return cmp(data);
        });

        return this;
    }
};