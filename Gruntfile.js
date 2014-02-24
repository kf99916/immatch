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
			imMatchWebsocketClient: {
				options: {
					banner: "<%= meta.imMatchWebsocketClient.banner %>",
                    process: function(src, filepath) {
                      return src.replace("@WEBSOCKET_URL", grunt.config.get("pkg.configurations.webSocketURL"));
                    }
				},
				src:["src/common/intro.js",
                    "src/websocket-client/3rd-party/*.js",
                    "src/common/core.js",
                    "src/common/log.js",
                    "src/common/math.js",
					"src/websocket-client/check-libraries.js",
                    "src/websocket-client/device.js",
                    "src/websocket-client/event.js",
                    "src/websocket-client/bind-touchevents.js",
                    "src/websocket-client/sync-gesture.js",
                    "src/websocket-client/socket-client.js",
					"src/websocket-client/exports.js", 
					"src/common/outro.js"],
				dest:"dist/immatch.js"
			},
            imMatchWebsocketServer: {
                options: {
                    banner: "<%= meta.imMatchWebsocketServer.banner %>"
                },
                src: ["src/common/intro.js",
                    "src/websocket-server/import.js",
                    "src/common/core.js",
                    "src/common/log.js",
                    "src/common/math.js",
                    "src/websocket-server/*.js",
                    "src/common/outro.js"],
                dest: "dist/immatch-ws-server.js"
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
                    "dist/immatch-ws-server.js"
                ],
                options: srcHintOptions
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
	grunt.registerTask( "watch", ["jsonlint", "concat", "uglify", "copy"]);

	// Default grunt.
	grunt.registerTask("default", ["jsonlint", "concat", "uglify"]);
};
