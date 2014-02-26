// 1. jQuery library
if (imMatch.isEmptyObject(jQuery)) {
    alert("jQuery library is not found. Please include jQuery before using imMatch. http://jquery.com/");
    window.stop();
}

// 2. MobileESP library
if (imMatch.isEmptyObject(MobileEsp)) {
    alert("MobileEsp library is not found. Please include MobileEsp before using imMatch. http://blog.mobileesp.com/");
    window.stop();
}