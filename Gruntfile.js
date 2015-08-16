

module.exports = function(grunt) {

    var _ = require("underscore");

    var libjsfiles = [
        "bower_components/underscore/underscore.js",
        "bower_components/jquery/dist/jquery.js",
        "bower_components/bootstrap/dist/js/bootstrap.js",
        "bower_components/ring/ring.js",
        "bower_components/spear/spear.js",
    ];
    var myjsfiles = [
        "src/js/app.js",
    ];
    var jsfiles = [].concat(libjsfiles).concat(myjsfiles);

    var libcssfiles = [
    ];
    var mycssfiles = [
        "src/style.css",
    ];
    var cssfiles = [].concat(libcssfiles).concat(mycssfiles);

    grunt.initConfig({
        jshint: {
            files: myjsfiles,
            options: {
                sub: true,
                eqeqeq: true, // no == or !=
                immed: true, // forces () around directly called functions
                forin: true, // makes it harder to use for in
                latedef: "nofunc", // makes it impossible to use a variable before it is declared
                newcap: true, // force capitalized constructors
                strict: true, // enforce strict mode
                trailing: true, // trailing whitespaces are ugly
                camelcase: true, // force camelCase
                strict: true, // forces strict mode
            },
        },
        less: {
            dev: {
                options: {
                    paths: ["."]
                },
                files: {
                    "src/style.css": "src/css/style.less",
                },
            }
        },
        watch: {
            less: {
                files: "src/css/**.less",
                tasks: ['less'],
            },
        },
        cssmin: {
            dist: {
                files: {
                    'static/style.css': cssfiles,
                }
            },
        },
        clean: {
            tmp: {
                src: [].concat(mycssfiles),
            },
            all: {
                src: ["static"],
            },
            tmpjs: {
                src: ['tmp.js'],
            }
        },
        uglify: {
            dist: {
                files: {
                    'static/all.js': jsfiles,
                }
            },
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, cwd: 'bower_components/bootstrap/dist/fonts/', src: ['*'], dest: 'static/libs/bootstrap/'},
                    {expand: true, flatten: true, cwd: 'src/fonts/', src: ['*'], dest: 'static/fonts/'},
                ]
            }
        },
        "file-creator": {
            dev_tmpjs: {
                files: [{
                    file: "tmp.js",
                    method: function(fs, fd, done) {
                        var files = _.map(cssfiles.concat(jsfiles), function(el) { return el; });
                        fs.writeSync(fd, "window['$'] = head.ready;\n" +
                        "head.load.apply(head, " + JSON.stringify(files) + ");\n");
                        done();
                    }
                }],
            },
            dev_css: {
                files: [{
                    file: "static/style.css",
                    method: function(fs, fd, done) {
                        fs.writeSync(fd, "");
                        done();
                    }
                }],
            },
        },
        concat: {
            dev: {
                src: ['bower_components/headjs/dist/1.0.0/head.load.js', 'tmp.js'],
                dest: 'static/all.js',
            },
        },
        shell: {
            images: {
                command: [
                ].join('&&'),
                options: {
                    stderr: true,
                    failOnError: true,
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-file-creator');

    grunt.registerTask('gen', ['jshint', 'less', 'copy', 'shell:images']);
    grunt.registerTask('dev', ['gen', 'file-creator:dev_tmpjs', 'file-creator:dev_css', "concat:dev", "clean:tmpjs"]);
    grunt.registerTask('dist', ['gen', 'uglify:dist', 'cssmin', "clean:tmp"]);
    grunt.registerTask('watcher', ['dev', 'watch']);

    grunt.registerTask('default', ['dev']);

};
