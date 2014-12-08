// window dom for NodeJs
window = require("jsdom").jsdom().parentWindow;

var jQuery = require("jquery/dist/jquery")(window),
    ws = require("ws");