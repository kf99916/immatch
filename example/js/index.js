$im.ready(function() {
    $im.logLevel = $im.infoLevel;

    var sprite = new imMatch.Sprite(),
        scene = new imMatch.Scene();

    sprite.setImage("taipei101");
    sprite.maxScalingFactor = 2;
    sprite.minScalingFactor = 0.5;

    scene.addSprite(sprite);

    $im.addScene(scene);

    $im.run(null, "127.0.0.1");
});