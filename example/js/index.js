$im.modechange(function(event, mode) {
    if (mode !== $im.mode.stitched) {
        return;
    }

    jQuery.each($im.scenes, function(i, scene) {
        jQuery.each(scene.sprites, function(i, sprite) {
            sprite.tween(3, {x: sprite.x + 3, y: sprite.y + 1});
        });
    });
});

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