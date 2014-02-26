$(document).ready(function() {
    $im.logLevel = $im.allLogLevels.debug;
    $im.logError("1 " + $im.rad({x: 1, y:1}, {x:1, y:0}) * 180 / Math.PI);
    $im.logError("2 " + $im.rad({x: 1, y:0}, {x:1, y:1}) * 180 / Math.PI);
    $im.logError("3 " + $im.rad({x: 1, y:1}, {x:1, y:1}) * 180 / Math.PI);
    $im.logError("4 " + $im.rad({x: 1, y:1}, {x:-1, y:-1}) * 180 / Math.PI);
    
    $im.run();
});