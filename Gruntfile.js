'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        clean: {
            main: {
                src: ['src/bi.js']
            }
        },
        eslint: {
            all: {
                src: [
                    'src/*.js'
                ]
            },
            teamcity: {
                options: {
                    format: 'checkstyle',
                    'output-file': 'target/eslint.xml'
                },
                src: ['<%= eslint.all.src %>']
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            target: {
                files: {
                    'dist/bi.min.js': ['src/bi.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['eslint', 'uglify:target']);

    grunt.registerTask('teamcity-check', ['eslint:teamcity']);
    grunt.registerTask('teamcity', ['build_sources', 'teamcity-check']);

    grunt.registerTask('all', ['install', 'default']);
};
