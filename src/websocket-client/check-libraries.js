// 1. jQuery library
if (jQuery === undefined) {
    alert("jQuery library is not found. \
        Please include it before using imMatch. http://jquery.com/");
    window.stop();
}

// 2. MobileESP library
if (jQuery.isEmptyObject(MobileEsp)) {
    alert("MobileEsp library is not found. \
        Please include it before using imMatch. http://blog.mobileesp.com/");
    window.stop();
}

if (!jQuery.isFunction(window.requestAnimationFrame)) {
    alert("window.requestAnimationFrame is not found. \
        Please include it before using imMatch. https://gist.github.com/paulirish/1579671");
    window.stop();
}

// 4. UUID generation library
if (!jQuery.isFunction(Math.uuidFast)) {
    alert("UUID generation library is not found. \
        Please include it before using imMatch. http://www.broofa.com/Tools/Math.uuid.js");
    window.stop();
}