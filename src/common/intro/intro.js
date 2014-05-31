
var jsdom = require("jsdom");

(function(global, factory) {

    factory(global);

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : jsdom.jsdom().createWindow(), function(window) {

"use strict";
