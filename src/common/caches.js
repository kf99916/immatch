imMatch.Cache = function() {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Cache) ) {
        return new imMatch.Cache();
    }
};

imMatch.Cache.prototype = {
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
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return [];
        }

        if (!jQuery.isFunction(cmp)) {
            return this[type];
        }

        return jQuery.grep(this[type], cmp);
    },

    getNRemove: function(type, cmp) {
        if (imMatch.isEmpty(type) || jQuery.isEmptyObject(this[type])) {
            return [];
        }

        return this.remove(type, cmp);
    },

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