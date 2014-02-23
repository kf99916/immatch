module.exports = function(grunt) {
	"use strict";

	function readOptionalJSON( filepath ) {
		var data = {};
		try {
			data = grunt.file.readJSON( filepath );
		} catch ( e ) {}
		return data;
	}

	var srcHintOptions = readOptionalJSON("src/jshintrc");

	// The concatenated file won't pass onevar
	// But our modules can
	delete srcHintOptions.onevar;

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		meta: {
			imMatch: {
				minBanner: "/*! <%= pkg.title %> v<%= pkg.version %> Client Javascript Library <%= pkg.homepage %> | <%= pkg.licenses[0].type %> license */",
				banner: "/*! <%= pkg.title %> v<%= pkg.version %> Client Javascript Library\n" + 
						" * <%= pkg.homepage %>\n" + 
						" *\n" +
						" * Copyright 2012, <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
						" * Released under the <%= pkg.licenses[0].type %> license\n" +
						" * <%= pkg.licenses[0].url %>\n" +
						" *\n" +
						" * Date: <%= grunt.template.today('yyyy-mm-dd') %>\n" + 
						" */"
			}
		},
		concat: {
			options: {
		      stripBanners: true
		    },
			imMatch: {
				options: {
					banner: "<%= meta.imMatch.banner %>"
				},
				src:["src/intro.js", 
					"src/check-libraries.js",
					"src/core.js",
					"src/device.js",
					"src/log.js",
					"src/math.js",
					"src/event.js",
					"src/bind-touchevents.js",
					"src/sync-gesture.js",
					"src/socket-client.js",
					"src/exports.js", 
					"src/outro.js"],
				dest:"dist/immatch.js"
			}
		},
		jsonlint: {
			pkg: {
				src: [ "package.json" ]
			}
		},
		jshint: {
			all: {
				src: [
					"src/**/*.js", "Gruntfile.js"
				],
				options: {
					jshintrc: true
				}
			},
			dist: {
				src: [
					"dist/immatch.js", 
				],
				options: srcHintOptions
			}
		},
		"regex-replace": {
			imMatch: {
				src: ["dist/immatch.js"],
				actions: [
					{
						name: "WebSocket URL",
						search: "@WEBSOCKET_URL",
						replace: "<%= pkg.configurations.webSocketURL %>"
					},
					{
						name: "WebSocket Protocols",
						search: "@WEBSOCKET_PROTOCOLS",
						replace: "<%= pkg.configurations.webSocketProtocols %>"
					}
				]
			}
		},
		uglify: {
			my_target: {
				files: {
					"dist/immatch.min.js": ["dist/immatch.js"]
				},
				options: {
					preserveComments: false,
					sourceMap: "dist/immatch.min.map",
					sourceMappingURL: "immatch.min.map",
					report: "min",
					beautify: {
						ascii_only: true
					},
					banner: "<%= meta.imMatch.minBanner %>",
					compress: {
						hoist_funs: false,
						loops: false,
						unused: false
					}
				}
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, cwd:"dist/", src: ["immatch.js"], dest: "<%= pkg.webServerDocuments %>/immatch-new/js/"},
					{expand: true, cwd:"example/", src: ["**"], dest: "<%= pkg.webServerDocuments %>/immatch-new/"}
				]
			}
		}
	});

	// Load grunt tasks from NPM packages
	require( "load-grunt-tasks" )( grunt );

	// Watch task
	grunt.registerTask( "watch", ["jsonlint", "concat", "regex-replace", "uglify", "copy"]);

	// Default grunt.
	grunt.registerTask("default", ["jsonlint", "concat", "regex-replace", "uglify"]);
};
