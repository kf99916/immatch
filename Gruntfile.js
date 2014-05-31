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
			imMatchWebsocketClient: {
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
			},
            imMatchWebsocketServer:
            {
                minBanner: "/*! <%= pkg.title %> v<%= pkg.version %> Websocket Server <%= pkg.homepage %> | <%= pkg.licenses[0].type %> license */",
                banner: "/*! <%= pkg.title %> v<%= pkg.version %> Websocket Server\n" +
                        " * <%= pkg.homepage %>\n" +
                        " *\n" +
                        " * Copyright 2012 <%= pkg.author.name %>\n" +
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
            imMatchWebsocketClientForJshint: {
                src:["src/common/intro/intro.js",
                    "src/websocket-client/check-libraries.js",
                    "src/common/intro/global-var.js",
                    "src/common/*.js",
                    "src/websocket-client/global-var.js",
                    "src/websocket-client/transform-proto.js",
                    "src/websocket-client/device.js",
                    "src/websocket-client/viewport.js",
                    "src/websocket-client/cursor-group.js",
                    "src/websocket-client/sync-gesture.js",
                    "src/websocket-client/*.js",
                    "src/common/outro/outro.js"],
                dest: "dist/immatch-jshint.js"
            },
			imMatchWebsocketClient: {
				options: {
					banner: "<%= meta.imMatchWebsocketClient.banner %>"
				},
				src:["src/common/intro/intro.js",
                    "src/common/3rd-party/*.js",
                    "src/websocket-client/3rd-party/*.js",
                    "src/websocket-client/check-libraries.js",
                    "src/common/intro/global-var.js",
                    "src/common/*.js",
                    "src/websocket-client/global-var.js",
                    "src/websocket-client/transformable.js",
                    "src/websocket-client/device.js",
                    "src/websocket-client/viewport.js",
                    "src/websocket-client/cursor-group.js",
                    "src/websocket-client/sync-gesture.js",
                    "src/websocket-client/*.js",
					"src/common/outro/outro.js"],
				dest: "dist/immatch.js"
			},
            imMatchWebsocketServerForJshint: {
                src: ["src/common/intro/intro.js",
                    "src/websocket-server/import.js",
                    "src/common/intro/global-var.js",
                    "src/common/*.js",
                    "src/websocket-server/global-var.js",
                    "src/websocket-server/*.js",
                    "src/common/outro/outro.js"],
                dest: "dist/immatch-ws-server-jshint.js"
            },
            imMatchWebsocketServer: {
                options: {
                    banner: "<%= meta.imMatchWebsocketServer.banner %>"
                },
                src: ["src/common/intro/intro.js",
                    "src/common/3rd-party/*.js",
                    "src/websocket-server/import.js",
                    "src/common/intro/global-var.js",
                    "src/common/*.js",
                    "src/websocket-server/global-var.js",
                    "src/websocket-server/*.js",
                    "src/common/outro/outro.js"],
                dest: "dist/immatch-ws-server.js"
            }
		},
		jsonlint: {
			pkg: {
				src: ["package.json"]
			},

            example: {
                src: ["example/**/*.json"]
            },
		},
		jshint: {
			all: {
                options: {
                    jshintrc: true
                },
				src: [
					"src/common/intro/global-var.js", "src/common/*.js",
                    "src/websocket-client/*.js", "src/websocket-server/**/*.js",
                    "Gruntfile.js"
				]
			},
			dist: {
                options: srcHintOptions,
                src: ["dist/immatch-jshint.js", "dist/immatch-ws-server-jshint.js"]
            }
		},
        clean: ["dist/immatch-jshint.js", "dist/immatch-ws-server-jshint.js"],
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
					banner: "<%= meta.imMatchWebsocketClient.minBanner %>",
					compress: {
						hoist_funs: false,
						loops: false,
						unused: false
					}
				}
			},
            my_advanced_target: {
                files: {
                    "dist/immatch-ws-server.min.js": ["dist/immatch-ws-server.js"]
                },
                options: {
                    preserveComments: false,
                    sourceMap: "dist/immatch-ws-server.min.map",
                    sourceMappingURL: "immatch-ws-server.min.map",
                    report: "min",
                    beautify: {
                        ascii_only: true
                    },
                    banner: "<%= meta.imMatchWebsocketServer.minBanner %>",
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
	grunt.registerTask( "watch", ["jsonlint", "concat", "jshint", "clean", "uglify", "copy"]);

	// Default grunt.
	grunt.registerTask("default", ["jsonlint", "concat", "jshint", "clean", "uglify"]);
};
