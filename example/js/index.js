$im.ready(function() {
    $im.logLevel = $im.debugLevel;
    $im.logError("1 " + $im.rad({x: 1, y:1}, {x:1, y:0}) * 180 / Math.PI);
    $im.logError("2 " + $im.rad({x: 1, y:0}, {x:1, y:1}) * 180 / Math.PI);
    $im.logError("3 " + $im.rad({x: 1, y:1}, {x:1, y:1}) * 180 / Math.PI);
    $im.logError("4 " + $im.rad({x: 1, y:1}, {x:-1, y:-1}) * 180 / Math.PI);


    var sprite = new imMatch.Sprite(),
        scene = new imMatch.Scene();

    sprite.setImage("taipei101");
    sprite.maxScalingFactor = 2;
    sprite.minScalingFactor = 0.5;
    sprite.rotate(Math.PI);
    sprite.translate({x: imMatch.viewport.width / 2, y: 0});

    scene.addSprite(sprite);

    $im.addScene(scene);

    $im.run();
});