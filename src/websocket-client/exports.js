    // Map over imMatch in case of overwrite
var _imMatch = window.imMatch,

    // Map over the $ in case of overwrite
    _$im = window.$im;

/**
 * Relinquish imMatch's control of the $im variable.
 * @name imMatch#noConflict
 * @function
 * @param {Boolean} deep Indicates whether to remove all imMatch variables from the global scope (including imMatch itself)
 * @returns {Object} Result imMatch object
 */
imMatch.noConflict = function(deep) {
    if (window.$im === imMatch) {
        window.$im = _$im;
    }

    if (deep && window.imMatch === imMatch) {
        window.imMatch = _imMatch;
    }

    return imMatch;
};

// Expose imMatch and $im identifiers
window.imMatch = window.$im = imMatch;