    // Map over jQuery in case of overwrite
var _imMatch = window.imMatch,

    // Map over the $ in case of overwrite
    _$im = window.$im;

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