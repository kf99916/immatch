/*! imMatch v1.0.1pre Websocket Server
 * https://bitbucket.org/kf99916/immatch
 *
 * Copyright 2012 Zheng-Xiang Ke (Kf Ke)
 * Released under the MIT license
 * https://bitbucket.org/kf99916/immatch/wiki/MIT%20LICENSE
 *
 * Date: 2014-12-09
 */
(function(global, factory) {

    factory(global);

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window) {

"use strict";

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };
})();

// window dom for NodeJs
window = require("jsdom").jsdom().parentWindow;

var jQuery = require("jquery/dist/jquery")(window),
    ws = require("ws");
function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

function generatePrefixMessage(mode) {
    return "[" + mode.toUpperCase() + "] " + Date() + " :";
}

Date.now = Date.now || function now() { return new Date().getTime(); };

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,

    arr = [],

    slice = arr.slice,

    indexOf = arr.indexOf,

    push = arr.push,

    unshift = arr.unshift,

    stringify = JSON.stringify,

    /**
     * imMatch is a JQuery object.
     * @namespace imMatch
     */
    imMatch = jQuery({});
imMatch.AffineTransform = function(m00, m10, m01, m11, m02, m12) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.AffineTransform) ) {
        return new imMatch.AffineTransform(m00, m10, m01, m11, m02, m12);
    }

    this.setTransform(m00, m10, m01, m11, m02, m12);
};

/**
 * Creates a scaling affine transform object.
 * @static
 * @param {Vector} scalingFactor {x: factor, y: factor}
 * @returns {AffineTransform} Result A scaling affine transform object
 */
imMatch.AffineTransform.getScaleInstance = function(scalingFactor) {
    return new imMatch.AffineTransform().setToScale(scalingFactor);
};

/**
 * Creates a translation affine transform object.
 * @static
 * @param {Vector} translationFactor {x: factor, y: factor}
 * @returns {AffineTransform} Result A translation affine transform object
 */
imMatch.AffineTransform.getTranslationInstance = function(translationFactor) {
    return new imMatch.AffineTransform().setToTranslation(translationFactor);
};

/**
 * Creates a shearing affine transform object.
 * @static
 * @param {Vector} shearFactor {x: factor, y: factor}
 * @returns {AffineTransform} Result A shearing affine transform object
 */
imMatch.AffineTransform.getShearInstance = function(shearFactor) {
    return new imMatch.AffineTransform().setToShear(shearFactor);
};

/**
 * Creates a rotation affine transform object which the rotation center is anchorPoint.
 * @static
 * @param {Float} rad unit: radian
 * @param {Vector} anchorPoint {x: float, y: float}
 * @returns {AffineTransform} Result A rotation affine transform object
 */
imMatch.AffineTransform.getRotateInstance = function(rad, anchorPoint) {
    return new imMatch.AffineTransform().setToRotation(rad, anchorPoint);
};

imMatch.AffineTransform.prototype = {
    /**
     * Setter
     * @param {Float} m00
     * @param {Float} m10
     * @param {Float} m01
     * @param {Float} m11
     * @param {Float} m02
     * @param {Float} m12
     * @returns {AffineTransform} Result A affine transform object
     */
    setTransform: function(m00, m10, m01, m11, m02, m12) {
        if (!jQuery.isNumeric(m00) || !jQuery.isNumeric(m01) || !jQuery.isNumeric(m02) ||
            !jQuery.isNumeric(m10) || !jQuery.isNumeric(m11) || !jQuery.isNumeric(m12)) {
            // Identity Matrix
            this.m00 = this.m11 = 1;
            this.m01 = this.m02 = this.m10 = this.m12 = 0;
            return this;
        }

        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m10 = m10;
        this.m11 = m11;
        this.m12 = m12;
        return this;
    },

    /**
     * Clones itself
     * @returns {AffineTransform} Result A affine transform object which values are the same.
     */
    clone: function() {
        return new imMatch.AffineTransform(this.m00, this.m10, this.m01, this.m11, this.m02, this.m12);
    },

    /**
     * Concatenates with a scaling affine transform <br>
     * [m00 m01 m02] [x 0 0] <br>
     * [m10 m11 m12] [0 y 0] <br>
     * [  0   0   1] [0 0 1]
     * @param {Vector} scalingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after concatenation
     */
    scale: function(scalingFactor) {
        return this.concatenate(imMatch.AffineTransform.getScaleInstance(scalingFactor));
    },

    /**
     * Pre-concatenates with a scaling affine transform <br>
     * [x 0 0] [m00 m01 m02] <br>
     * [0 y 0] [m10 m11 m12] <br>
     * [0 0 1] [  0   0   1]
     * @param {Vector} scalingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preScale: function(scalingFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getScaleInstance(scalingFactor));
    },

    /**
     * Concatenates with a translation affine transform <br>
     * [m00 m01 m02] [1 0 x] <br>
     * [m10 m11 m12] [0 1 y] <br>
     * [  0   0   1] [0 0 1]
     * @param {Vector} translationFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after concatenation
     */
    translate: function(translationFactor) {
        return this.concatenate(imMatch.AffineTransform.getTranslationInstance(translationFactor));
    },

    /**
     * Pre-concatenates with a translation affine transform <br>
     * [1 0 x] [m00 m01 m02] <br>
     * [0 1 y] [m10 m11 m12] <br>
     * [0 0 1] [  0   0   1]
     * @param {Vector} translationFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preTranslate: function(translationFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getTranslationInstance(translationFactor));
    },

    /**
     * Concatenates with a rotation affine transform which the rotation center is anchorPoint. <br>
     * [m00 m01 m02] [ cos sin (x - x * cos + y * sin)] <br>
     * [m10 m11 m12] [-sin cos (y - x * sin - y * cos)] <br>
     * [  0   0   1] [   0   0                       1]
     * @param {Float} rad unit: radian
     * @param {Object} anchorPoint {x: float, y: float}
     * @returns {AffineTransform} Result Result after concatenation
     */
    rotate: function(rad, anchorPoint) {
        return this.concatenate(imMatch.AffineTransform.getRotateInstance(rad, anchorPoint));
    },

    /**
     * Pre-concatenates with a rotation affine transform which the rotation center is anchorPoint. <br>
     * [ cos sin (x - x * cos + y * sin)] [m00 m01 m02] <br>
     * [-sin cos (y - x * sin - y * cos)] [m10 m11 m12] <br>
     * [   0   0                       1] [  0   0   1]
     * @param {Float} rad unit: radian
     * @param {Object} anchorPoint {x: float, y: float}
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preRotate: function(rad, anchorPoint) {
        return this.preConcatenate(imMatch.AffineTransform.getRotateInstance(rad, anchorPoint));
    },

    /**
     * Concatenates with a shearing affine transform. <br>
     * [m00 m01 m02] [1 x 0] <br>
     * [m10 m11 m12] [y 1 0] <br>
     * [  0   0   1] [0 0 1]
     * @param {Vector} shearFactor {x: float, y: float}
     * @returns {AffineTransform} Result Result after concatenation
     */
    shear: function(shearFactor) {
        return this.concatenate(imMatch.AffineTransform.getShearInstance(shearFactor));
    },

    /**
     * Pre-concatenates with a shearing affine transform. <br>
     * [1 x 0] [m00 m01 m02] <br>
     * [y 1 0] [m10 m11 m12] <br>
     * [0 0 1] [  0   0   1]
     * @param {Vector} shearFactor {x: float, y: float}
     * @returns {AffineTransform} Result Result after pre-concatenation
    */
    preShear: function(shearFactor) {
        return this.preConcatenate(imMatch.AffineTransform.getShearInstance(shearFactor));
    },

    /**
     * Concatenates a affine transform.
     * this * tx
     * @param {AffineTransform} tx
     * @returns {AffineTransform} Result Result after concatenation
     */
    concatenate: function(tx) {
        if (imMatch.isEmpty(tx) ||
            !jQuery.isNumeric(tx.m00) || !jQuery.isNumeric(tx.m01) || !jQuery.isNumeric(tx.m02) ||
            !jQuery.isNumeric(tx.m10) || !jQuery.isNumeric(tx.m11) || !jQuery.isNumeric(tx.m12)) {
            return this;
        }
        var m0 = this.m00, m1 = this.m01;
        this.m00 = tx.m00 * m0 + tx.m10 * m1;
        this.m01 = tx.m01 * m0 + tx.m11 * m1;
        this.m02 += tx.m02 * m0 + tx.m12 * m1;

        m0 = this.m10;
        m1 = this.m11;
        this.m10 = tx.m00 * m0 + tx.m10 * m1;
        this.m11 = tx.m01 * m0 + tx.m11 * m1;
        this.m12 += tx.m02 * m0 + tx.m12 * m1;
        return this;
    },

    /**
     * Pre-concatenates a affine transform.
     * tx * this
     * @param {AffineTransform} tx
     * @returns {AffineTransform} Result Result after pre-concatenation
     */
    preConcatenate: function(tx) {
        if (imMatch.isEmpty(tx) ||
            !jQuery.isNumeric(tx.m00) || !jQuery.isNumeric(tx.m01) || !jQuery.isNumeric(tx.m02) ||
            !jQuery.isNumeric(tx.m10) || !jQuery.isNumeric(tx.m11) || !jQuery.isNumeric(tx.m12)) {
            return this;
        }

        var m0 = this.m00, m1 = this.m10;
        this.m00 = tx.m00 * m0 + tx.m01 * m1;
        this.m10 = tx.m10 * m0 + tx.m11 * m1;

        m0 = this.m01;
        m1 = this.m11;
        this.m01 = tx.m00 * m0 + tx.m01 * m1;
        this.m11 = tx.m10 * m0 + tx.m11 * m1;

        m0 = this.m02;
        m1 = this.m12;
        this.m02 = tx.m00 * m0 + tx.m01 * m1 + tx.m02;
        this.m12 = tx.m10 * m0 + tx.m11 * m1 + tx.m12;
        return this;
    },

    /**
     * Transforms a vector to another vector through this affine transform.
     *      [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
     *      [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
     *      [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
     * @param {Vector} vec {x: float, y: float}
     * @returns {Vector} Result Transformation result: {x: float, y: float}
     */
    transform: function(vec) {
        if (!imMatch.is2DVector(vec)) {
            return {x: 0, y: 0};
        }

        return {
            x: vec.x * this.m00 + vec.y * this.m01 + this.m02,
            y: vec.x * this.m10 + vec.y * this.m11 + this.m12
        };
    },

    /**
     * Computes determinant
     * @returns {Float} Result determinant
     */
    getDeterminant: function() {
        return this.m00 * this.m11 - this.m01 * this.m10;
    },

    /**
     * Invertible or not
     * @returns {Boolean} Result True if the affine transform is invertible; otherwise, false
     */
    isInvertible: function() {
        var det = this.getDeterminant();
        return (jQuery.isNumeric(det) && jQuery.isNumeric(this.m02) &&
            jQuery.isNumeric(this.m12) && det !== 0);
    },

    /**
     * Computes the inversion affine transform. The result is stored by itself.
     * @returns {AffineTransform} Result Inversion affine transform
     */
    inverse: function() {
        if (!this.isInvertible) {
            return this;
        }

        var det = this.getDeterminant(),
            m00 = this.m00, m10 = this.m10, m01 = this.m01,
            m11 = this.m11, m02 = this.m02, m12 = this.m12;

        this.m00 = m11 / det;
        this.m10 = -m10 / det;
        this.m01 = -m01 / det;
        this.m11 = m00 / det;
        this.m02 = (m01 * m12 - m11 * m02) / det;
        this.m12 = (m10 * m02 - m00 * m12) / det;

        return this;
    },

    /**
     * Computes the inversion affine transform. Do not modify inself.
     * @returns {AffineTransform} Result Inversion affine transform
     */
    createInverse: function() {
        if (!this.isInvertible) {
            return this;
        }

        return this.clone().inverse();
    },

    /**
     * Setter to a scaling affine transform.
     * @param {Vector} scalingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result Ascaling affine transform
     */
    setToScale: function(scalingFactor) {
        if (jQuery.isEmptyObject(scalingFactor)) {
            scalingFactor = {x: 1, y: 1};
        }
        return this.setTransform(scalingFactor.x, 0, 0, scalingFactor.y, 0, 0);
    },

    /**
     * Setter to a translation affine transform.
     * @param {Vector} translationFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result A translation affine transform
     */
    setToTranslation: function(translationFactor) {
        if (jQuery.isEmptyObject(translationFactor)) {
            translationFactor = {x: 0, y: 0};
        }
        return this.setTransform(1, 0, 0, 1, translationFactor.x, translationFactor.y);
    },

    /**
     * Setter to a shearing affine transform.
     * @param {Vector} shearingFactor {x: factor, y: factor}
     * @returns {AffineTransform} Result A shearing affine transform
     */
    setToShear: function(shearFactor) {
        if (jQuery.isEmptyObject(shearFactor)) {
            shearFactor = {x: 0, y: 0};
        }
        return this.setTransform(1, shearFactor.y, shearFactor.x, 1, 0, 0);
    },

    /**
     * Setter to a rotation affine transform.
     * @param {Float} rad unit: radian
     * @param {Vector} anchorPoint {x: float, y: float}
     * @returns {AffineTransform} Result A rotation affine transform
     */
    setToRotation: function(rad, anchorPoint) {
        if (jQuery.isEmptyObject(anchorPoint)) {
            anchorPoint = {x: 0, y: 0};
        }
        rad = (jQuery.isNumeric(rad))? rad : 0;

        var cos = Math.cos(rad), sin = Math.sin(rad);
        return this.setTransform(cos, sin, -sin, cos,
            anchorPoint.x - anchorPoint.x * cos + anchorPoint.y * sin,
            anchorPoint.y - anchorPoint.x * sin - anchorPoint.y * cos);

    },

    /**
     * Serializes all of the members as a json.
     * @returns {Array} Result [m00, m10, m01, m11, m02, m12]
     */
    toJSON: function() {
        return [this.m00, this.m10, this.m01, this.m11, this.m02, this.m12];
    },

    /**
     * Prints the affine transform.
     */
    print: function() {
        window.console.log("[ " + this.m00 + " " + this.m01 + " " + this.m02 + " ]");
        window.console.log("[ " + this.m10 + " " + this.m11 + " " + this.m12 + " ]");
        window.console.log("[ 0 0 1 ]");
        window.console.log();
    }
};
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
jQuery.extend(imMatch, {
    isReady: returnFalse,

    /**
     * Document is loaded and all of need imgas are also loaded. Then invoke the function.
     * @param {Function} fn The invoked function
     * @memberof! imMatch#
     */
    ready: function(fn) {
        if (imMatch.isReady()) {
            return this;
        }

        jQuery(document).ready(function() {
            imMatch.loader.load(fn);
        });

        return this;
    },

    /**
     * Determines whether the test object is a 2D vector or not.
     * @param {Object} object Test object
     * @returns {Boolean} Result True if the object is a 2D vector; otherwise, false.
     * @memberof! imMatch#
     */
    is2DVector: function(object) {
        if (jQuery.isEmptyObject(object)) {
            return false;
        }

        return (jQuery.isNumeric(object.x) && jQuery.isNumeric(object.y));
    },

    /**
     * Determines whether the test object is undefined or null or not.
     * @param {Object} object Test object
     * @returns {Boolean} Result True if the object is undefined or null; otherwise, false.
     * @memberof! imMatch#
     */
    isEmpty: function(object) {
        return (object === undefined || object === null);
    },

    /**
     * Removes a element from a plaint object or an array-like object.
     * @param {Object} object A plaint object or an array-like object
     * @param {String} name Removed property name
     * @returns {Object} Result Object which the property is removed
     * @memberof! imMatch#
     */
    remove: function(object, name) {
        if (jQuery.isEmptyObject(name)) {
            return object;
        }

        if (jQuery.isArray(object)) {
            slice.call(object, name, 1);
        }
        else if (jQuery.isPlainObject(object)) {
            delete object[name];
        }

        return object;
    }
});
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

jQuery.extend(imMatch, {
    /**
     * Rotates the given point by rad with a specified point as the anchor point.
     * @param {Vector} point {x: float, y: float}
     * @param {Float} rad unit: Raidan
     * @param {Vector} center {x: float, y: float}. The defalut value is {x: 0, y: 0} (Optional)
     * @returns {Vector} Result Rotated vector {x: float, y: float}
     * @memberof! imMatch#
     */
    rotate: function(point, rad, /* Optional */ center) {
        var vec, cos, sin;
        if (!jQuery.isNumeric(rad) || rad === 0 || imMatch.isEmpty(point.x) || imMatch.isEmpty(point.y)) {
            return point;
        }

        center = center || {x:0, y:0};

        vec = {x: point.x - center.x, y: point.y - center.y};
        cos = Math.cos(rad);
        sin = Math.sin(rad);

        return {
            x: center.x + vec.x * cos - vec.y * sin,
            y: center.y + vec.x * sin + vec.y * cos
        };
    },

    /**
     * Returns the largest argument or element in array and index.
     * @returns {Object} Result The max element
     * @memberof! imMatch#
     */
    max: function() {
        var target = arguments[0],
            result = {index:-1, value: +Infinity};

        if (!jQuery.isArrayLike(target)) {
            target = [];
            jQuery.each(arguments, function(i, argument) {
                push.call(target, argument);
            });
        }

        result.value = Math.max.apply(Math, target);
        result.index = indexOf.call(target, result.value);

        return result;
    },

    /**
     * Returns the smallest argument or element in array and index.
     * @returns {Object} Result The min element
     * @memberof! imMatch#
     */
    min: function() {
        var target = arguments[0],
            result = {index:-1, value: -Infinity};

        if (!jQuery.isArrayLike(target)) {
            target = [];
            jQuery.each(arguments, function(i, argument) {
                push.call(target, argument);
            });
        }

        result.value = Math.min.apply(Math, target);
        result.index = indexOf.call(target, result.value);

        return result;
    },

    /**
     * Computes Remainder.
     * @param {Int} dividend The dividend
     * @param {Int} divisor The divisor
     * @returns {Int} Result A positive number
     * @memberof! imMatch#
     */
    mod: function(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    },

    /**
     * Performs dot operation.
     * @param {Vector} vector1 {x: float, y: float}
     * @param {Vector} vector2 {x: float, y: float}
     * @returns {Float} Result Dot
     * @memberof! imMatch#
     */
    dot: function(vector1, vector2) {
        if (!imMatch.is2DVector(vector1) || !imMatch.is2DVector(vector2)) {
            return 1;
        }

        return (vector1.x * vector2.x + vector1.y * vector2.y);
    },

    /**
     * Comptes a radian between two given vectors
     * @param {Vector} vector1 {x: float, y: float}
     * @param {Vector} vector2 {x: float, y: float}
     * @returns {Float} Result Radian. -pi ~ pi
     * @memberof! imMatch#
     */
    rad: function(vector1, vector2) {
        if (!imMatch.is2DVector(vector1) || !imMatch.is2DVector(vector2)) {
            return 0;
        }

        return  Math.atan2(vector1.x * vector2.y - vector2.x * vector1.y , imMatch.dot(vector1, vector2));
    },

    /**
     * Performs norm operation
     * @param {Vector} vector {x: float, y: float}
     * @returns {Float} Result Norm
     * @memberof! imMatch#
     */
    norm: function(vector) {
        return Math.sqrt(imMatch.dot(vector, vector));
    },

    /**
     * Rounds off a number
     * @param {Float} number
     * @returns {Int} Result round number
     * @memberof! imMatch#
     */
    round: function(number) {
        if (!jQuery.isNumeric(number)) {
            return number;
        }

        return ~~(number + 0.5);
    }
});
window.WebSocket = window.WebSocket || {};
window.WebSocket.OPEN = window.WebSocket.OPEN || 1;

jQuery.extend(imMatch, {
    /**
     * THe life time of candidates. A candidate means the device is possible to be stitched with the other device.
     * @constant
     * @default
     * @memberof! imMatch#
     */
    lifetimeCandidate: 2000
});
imMatch.Device = function(webSocket) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Device) ) {
        return new imMatch.Device(webSocket);
    }

    this.id = Math.uuidFast();
    this.webSocket = webSocket;
};

imMatch.Device.prototype = {
    /**
     * Sends a given data to the device.
     * @param {Object} data The request data
     */
    send: function(data) {
        if (jQuery.isEmptyObject(data) || imMatch.isEmpty(data.action)) {
            imMatch.logError("[imMatch.Device.send] The format of message is wrong! Message: ", data);
            return this;
        }

        if (this.webSocket.readyState !== window.WebSocket.OPEN) {
            imMatch.logError("[imMatch.Device.send] WebSocket is not ready. ready state: " + this.webSocket.readyState);
            return this;
        }

        try {
            this.webSocket.send(stringify.call(this, data));
        } catch(error) {
            imMatch.error("[imMatch.Group.addGroup] WEbSocket failed to send message. Error Message: " + error.message);
        }

        return this;
    }
};

/**
 * Creates a Group object.
 * @class
 * @classdesc All the devices in the same group are synchronized with the touchMouseEvent.
 * @constructor
 * @param {Object} devices The devnces
 */
imMatch.Group = function(devices) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof imMatch.Group) ) {
        return new imMatch.Group(devices);
    }

    this.id = Math.uuidFast();
    this.devices = [];
    this.numExchangedDoneDevices = 0;
    this.numDevicesSynced = {};
    this.addDevices(devices);
};

imMatch.Group.prototype = {
    /**
     * Adds devices into the group.
     * @param {Object} devices The devnces
     */
    addDevices: function(devices) {
        if (jQuery.isEmptyObject(devices)) {
            return this;
        }

        if(!jQuery.isArray(devices)) {
            devices = [devices];
        }

        push.apply(this.devices, devices);

        return this;
    },

    /**
     * Synchronizes all the devices in the group.
     * The group send "synchronizeDone" message if all the devices are synchronized in the chunk.
     * @param {Object} jsonObject The data needs to be synchronized
     */
    synchronize: function(jsonObject) {
        if (jQuery.isEmptyObject(jsonObject)) {
            return this;
        }

        this.broadcast(jsonObject);

        if (imMatch.isEmpty(this.numDevicesSynced[jsonObject.chunk])) {
            this.numDevicesSynced[jsonObject.chunk] = 0;
        }

        ++this.numDevicesSynced[jsonObject.chunk];
        if (this.numDevicesSynced[jsonObject.chunk] !== this.devices.length) {
            return this;
        }

        delete this.numDevicesSynced[jsonObject.chunk];
        if (this.stitch()) {
            return this;
        }

        this.broadcast({
            action: "synchronizeDone",
            chunk: jsonObject.chunk
        });
        return this;
    },

    /**
     * Broadcasts messgaes to all the devices in the group.
     * @param {Object} data The request data
     */
    broadcast: function(data) {
        if (jQuery.isEmptyObject(data)) {
            return this;
        }

        jQuery.each(this.devices, function(i, device) {
            device.send(data);
        });

        return this;
    },

    /**
     * Gets the group's stitching information.
     * @returns {Object} Result The group's stitching information
     */
    getStitchingInfo: function() {
        var self = this, stitchingInfos = imMatch.webSocketServer.caches.get("stitchingInfo"), result;
        jQuery.each(stitchingInfos, function(i, stitchingInfo) {
            if (self.id === stitchingInfo[0].groupID || self.id === stitchingInfo[1].groupID) {
                result = stitchingInfo;
                return false;
            }
        });

        return result;
    },

    /**
     * Sends the stitching information.
     * @returns {Boolean} True if the stitching information succedded to be sent; otherwise, false
     */
    stitch: function() {
        var stitchingInfo = this.getStitchingInfo();
        if (jQuery.isEmptyObject(stitchingInfo)) {
            return false;
        }

        if (this.id === stitchingInfo[1].groupID) {
            stitchingInfo = stitchingInfo.reverse();
        }

        this.broadcast({
            action: "stitching",
            stitchingInfo: stitchingInfo
        });

        imMatch.logInfo("[imMatch.Group.stitch][device1]", stitchingInfo[0], "[device2]", stitchingInfo[1]);

        return true;
    }
};
jQuery.extend(ws.Server.prototype, {
    /**
     * The stitching groups. Each group shares the sanme virtual space.
     * @default
     * @memberof! ws.Server#
     */
    groups: {},

    /**
     * Caches
     * @default
     * @memberof! ws.Server#
     */
    caches: new imMatch.Cache(),

    /**
     * Adds a new group. "connectionSuccess" message is sent if a new group succedded to be added.
     * @param {Object} webSocket The WebSocket of the device
     * @memberof! ws.Server#
     */
    addGroup: function(webSocket) {
        var group, device;
        if (jQuery.isEmptyObject(webSocket)) {
            imMatch.logWarn("[ws.Server.addGroup] NO webSocket.");
            return this;
        }

        device = new imMatch.Device(webSocket);
        group = new imMatch.Group(device);
        this.groups[group.id] = group;

        device.send({
            action: "connectionSuccess",
            groupID: group.id,
            deviceID: device.id,
            numDevices: group.devices.length
         });

        return group;
    },

    /**
     * Monitor the caches. Remove the dead candidates.
     * @memberof! ws.Server#
     */
    monitorCaches: function() {
        var now = Date.now();
        this.caches.remove("stitchingCandidate", function(candidate) {
            return (Math.abs(now - candidate.timeStamp) > imMatch.lifetimeCandidate);
        });

        setTimeout(this.monitorCaches.bind(this), imMatch.lifetimeCandidate);

        return this;
    },

    /**
     * Adds a new candidate into the cahes.
     * @param {Object} newCandidate The new candidate
     * @memberof! ws.Server#
     */
    addCandidate: function(newCandidate) {
        if (jQuery.isEmptyObject(newCandidate)) {
            return this;
        }

        this.caches.remove("stitchingCandidate", function(candidate) {
            return (newCandidate.groupID === candidate.groupID && newCandidate.deviceID === candidate.deviceID);
        });

        this.caches.queue("stitchingCandidate", newCandidate);

        return this;
    },

    /**
     * Searchs a matched candidate. These two devices will be stitched if found.
     * @param {Object} jsonObject The sitching information
     * @memberof! ws.Server#
     */
    searchMatchCandidate: function(jsonObject) {
        var candidates = this.caches.get("stitchingCandidate"), match;
        if (jQuery.isEmptyObject(jsonObject)) {
            return null;
        }

        jQuery.each(candidates.reverse(), function(i, candidate) {
            if (jsonObject.deviceID !== candidate.deviceID &&
                Math.abs(jsonObject.timeStamp - candidate.timeStamp) < imMatch.lifetimeCandidate) {
                match = candidate;
                return false;
            }
        });

        return match;
    },

    /**
     * Computes a affine transforma for stitching
     * @param {Object} stitchingInfo The sitching information
     * @memberof! ws.Server#
     */
    computeAffineFactor: function(stitchingInfo) {
        stitchingInfo.rad = imMatch.rad(stitchingInfo.orientation, {x: 1, y: 0});
        var rotateTransform = imMatch.AffineTransform.getRotateInstance(stitchingInfo.rad);

        stitchingInfo.margin = rotateTransform.transform(stitchingInfo.margin);
        stitchingInfo.point = rotateTransform.transform(stitchingInfo.point);

        stitchingInfo.translationFactor = {
            x: stitchingInfo.margin.x - stitchingInfo.point.x,
            y: stitchingInfo.margin.y - stitchingInfo.point.y
        };

        delete stitchingInfo.margin;
        delete stitchingInfo.point;
        delete stitchingInfo.orientation;

        return this;
    },

    /**
     * Responses the received message. Here are all the responses:
     * "connection", "close", "error", "tryToStitch", "synchronize", "exchange", and "exchangeDone".
     * @memberof! ws.Server#
     */
    response: {
        connection: function(webSocket) {
            this.addGroup(webSocket);

            return this;
        },

        close: function(event, webSocket) {
            imMatch.logInfo("[ws.Server.response.close] The client closes WebSocket." +
                " deviceID = " + webSocket.deviceID + ", groupID = " + webSocket.groupID + ". Message: " + event.message);

            return this;
        },

        error: function(event, webSocket) {
            jQuery.error("[ws.Server.response.error] WebSocket error. Device: " +
                webSocket.deviceID + ", in group: " + webSocket.groupID + ". Error message: " + event.message);
        },

        tryToStitch: function(jsonObject) {
            var match = this.searchMatchCandidate(jsonObject), group, matchGroup, numDevicesInGroup, numDevicesInMatchGroup;
            if (jQuery.isEmptyObject(match)) {
                this.addCandidate(jsonObject);
                return this;
            }

            group = this.groups[jsonObject.groupID];
            matchGroup = this.groups[match.groupID];

            if (imMatch.isEmpty(group) || imMatch.isEmpty(matchGroup)) {
                imMatch.logError("[ws.Server.tryToStitch] group or matchGroup are empty." +
                        " group:", group, "matchGroup:", matchGroup);
                return this;
            }

            if (!jQuery.isEmptyObject(group.getStitchingInfo()) ||
                !jQuery.isEmptyObject(matchGroup.getStitchingInfo())) {
                imMatch.logDebug("[ws.Server.tryToStitch] Groups are stitching." +
                        " group:", group, "matchGroup:", matchGroup);
                return this;
            }

            // Restitch devices
            if (group.id === matchGroup.id) {
                return this;
            }

            group.numDevicesSynced = {};
            matchGroup.numDevicesSynced = {};

            numDevicesInGroup = group.devices.length;
            numDevicesInMatchGroup = matchGroup.devices.length;

            // Reverse stitch orientation of the later device
            jsonObject.orientation.x = -jsonObject.orientation.x;
            jsonObject.orientation.y = -jsonObject.orientation.y;

            this.computeAffineFactor(jsonObject);
            this.computeAffineFactor(match);

            jsonObject.numExchangedDevices = numDevicesInMatchGroup;
            match.numExchangedDevices = numDevicesInGroup;

            this.caches.queue("stitchingInfo", [jsonObject, match]);
            group.stitch();
            matchGroup.stitch();
        },

        synchronize: function(jsonObject) {
            this.groups[jsonObject.groupID].synchronize(jsonObject);
            return this;
        },

        exchange: function(jsonObject) {
            var toGroup = this.groups[jsonObject.toGroupID];
            if (jQuery.isEmptyObject(toGroup)) {
                return this;
            }

            toGroup.broadcast(jsonObject);
        },

        exchangeDone: function(jsonObject) {
            var group = this.groups[jsonObject.groupID], toGroup = this.groups[jsonObject.toGroupID],
                totalNumDevies = group.devices.length + toGroup.devices.length;

            ++group.numExchangedDoneDevices;
            ++toGroup.numExchangedDoneDevices;
            if (totalNumDevies !== group.numExchangedDoneDevices ||
                totalNumDevies !== toGroup.numExchangedDoneDevices) {
                return this;
            }

            group.numExchangedDoneDevices = 0;

            this.caches.remove("stitchingInfo");

            group.addDevices(toGroup.devices);
            delete this.groups[jsonObject.toGroupID];

            group.broadcast({
                action: "exchangeDone",
                groupID: group.id,
                numDevices: group.devices.length
            });
        }
    }
});

imMatch.logLevel = imMatch.infoLevel;
imMatch.isReady = returnTrue;

imMatch.webSocketServer = new ws.Server({port: 8080, host:null});

imMatch.webSocketServer.on("connection", function(webSocket) {
    var self = this;

    this.response.connection.call(this, webSocket);

    webSocket.on("message", function(event) {
        var jsonObject, response;
        if (jQuery.isEmptyObject(event)) {
            imMatch.logError("[WebSocket.onmessage] The message is empty!");
            return;
        }

        jsonObject = jQuery.parseJSON(event);
        // Normalize timeStamp (Server time)
        jsonObject.timeStamp = Date.now();
        imMatch.logDebug("[WebSocket.onmessage] Action Type: " + jsonObject.action, jsonObject);

        response = self.response[jsonObject.action];
        if (imMatch.isEmpty(response)) {
            imMatch.logWarn("[WebSocket.onmessage] Unknown action: " + jsonObject.action);
            return;
        }

        response.call(self, jsonObject);
    });

    webSocket.on("close", function(event) {
        self.response.close.call(self, event, webSocket);
    });

    webSocket.on("error", function(event) {
        self.response.error.call(self, event, webSocket);
    });
});

// The underlying server emits an error
imMatch.webSocketServer.on("error", function(event) {
    jQuery.error("[imMatch.webSocketServer] WebSocket Server error. error message: " + event.message);
});

imMatch.webSocketServer.monitorCaches();
return imMatch;

}));
