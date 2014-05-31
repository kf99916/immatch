// window dom for NodeJs
window = require("jsdom").jsdom().createWindow();

var jQuery = require("jquery/dist/jquery")(window),
    ws = require("ws");