var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    del = require('del'),
    pkg = require('./package.json'),
    now = new Date(),
    today = {
        year: plugins.util.date(now, 'yyyy'),
        date: plugins.util.date(now, 'yyyy-mm-dd')
    };

gulp.task('client-jshint', function() {
    return gulp.src([
        'src/common/intro/intro.js',
        'src/websocket-client/check-libraries.js',
        'src/common/intro/global-var.js',
        'src/common/*.js',
        'src/websocket-client/global-var.js',
        'src/websocket-client/transform-proto.js',
        'src/websocket-client/device.js',
        'src/websocket-client/viewport.js',
        'src/websocket-client/cursor-group.js',
        'src/websocket-client/sync-gesture.js',
        'src/websocket-client/*.js',
        'src/common/outro/outro.js'])
    .pipe(plugins.concat('immatch.js'))
    .pipe(plugins.jshint('src/jshintrc'))
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('server-jshint', function() {
    return gulp.src([
        'src/common/intro/intro.js',
        'src/websocket-server/import.js',
        'src/common/intro/global-var.js',
        'src/common/*.js',
        'src/websocket-server/global-var.js',
        'src/websocket-server/*.js',
        'src/common/outro/outro.js'])
    .pipe(plugins.concat('immatch-ws-server.js'))
    .pipe(plugins.jshint('src/jshintrc'))
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('jshint', function() {
    gulp.start('client-jshint', 'server-jshint');
});

gulp.task('client-scripts', function() {
    var banner = ['/**',
            ' * <%= pkg.title %> v<%= pkg.version %> Client Javascript Framework',
            ' * <%= pkg.homepage %>',
            ' *',
            ' * Copyright 2012, <%= today.year %> <%= pkg.author.name %>',
            ' * Released under the <%= pkg.licenses[0].type %> license',
            ' * <%= pkg.licenses[0].url %>',
            ' *',
            ' * Date: <%= today.date %>',
            ' */',
            ''].join('\n'),
        minBanner = ['/**',
            ' * <%= pkg.title %> v<%= pkg.version %> Client Javascript Framework <%= pkg.homepage %> | <%= pkg.licenses[0].type %> license',
            ' */',
            ''].join('\n');

    return gulp.src([
                'src/common/intro/intro.js',
                'src/common/3rd-party/*.js',
                'src/websocket-client/3rd-party/*.js',
                'src/websocket-client/check-libraries.js',
                'src/common/intro/global-var.js',
                'src/common/*.js',
                'src/websocket-client/global-var.js',
                'src/websocket-client/transformable.js',
                'src/websocket-client/device.js',
                'src/websocket-client/viewport.js',
                'src/websocket-client/cursor-group.js',
                'src/websocket-client/sync-gesture.js',
                'src/websocket-client/*.js',
                'src/common/outro/outro.js'])
            .pipe(plugins.concat('immatch.js'))
            .pipe(plugins.header(banner, {pkg : pkg, today: today}))
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('examples/pano/js'))
            .pipe(plugins.rename({suffix: '.min'}))
            .pipe(plugins.uglify())
            .pipe(plugins.header(minBanner, {pkg : pkg, today: today}))
            .pipe(gulp.dest('dist'))
});

gulp.task('server-scripts', function() {
    var banner = ['/**',
            ' * <%= pkg.title %> v<%= pkg.version %> Websocket Server',
            ' * <%= pkg.homepage %>',
            ' *',
            ' * Copyright 2012, <%= today.year %> <%= pkg.author.name %>',
            ' * Released under the <%= pkg.licenses[0].type %> license',
            ' * <%= pkg.licenses[0].url %>',
            ' *',
            ' * Date: <%= today.date %>',
            ' */',
            ''].join('\n'),
        minBanner = ['/**',
            ' * <%= pkg.title %> v<%= pkg.version %> Websocket Server <%= pkg.homepage %> | <%= pkg.licenses[0].type %> license',
            ' */',
            ''].join('\n');

    return gulp.src([
                'src/common/intro/intro.js',
                'src/common/3rd-party/*.js',
                'src/websocket-server/import.js',
                'src/common/intro/global-var.js',
                'src/common/*.js',
                'src/websocket-server/global-var.js',
                'src/websocket-server/*.js',
                'src/common/outro/outro.js'])
            .pipe(plugins.concat('immatch-ws-server.js'))
            .pipe(plugins.header(banner, {pkg : pkg, today: today}))
            .pipe(gulp.dest('dist'))
            .pipe(plugins.rename({suffix: '.min'}))
            .pipe(plugins.uglify())
            .pipe(plugins.header(minBanner, {pkg : pkg, today: today}))
            .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
    gulp.start('client-scripts', 'server-scripts');
});

gulp.task('copy', function() {
    return gulp.src('dist/immatch.min.js')
            .pipe(gulp.dest('examples/pano/js'));
});

gulp.task('clean', function(cb) {
    del(['dist/*', 'examples/**/immatch.js'], cb);
});

gulp.task('webserver', function() {
    return gulp.src('examples')
            .pipe(plugins.webserver({
                livereload: true,
                open: "http://localhost:8000/pano"
            }));
});

gulp.task('websocketserver', function () {
    plugins.nodemon({script: 'dist/immatch-ws-server.js', ext: 'js'})
        .on('change', ['server-jshint', 'server-scripts'])
        .on('restart', function () {
            console.log('Websocket server restarted!')
        });
})

gulp.task('default', ['clean'], function() {
    gulp.start('jshint', 'scripts');
});