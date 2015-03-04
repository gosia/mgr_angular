'use strict';
/* global module */
/* global require */


module.exports = function (grunt) {

  require('time-grunt')(grunt);

  require('load-grunt-tasks')(grunt);

  var config = {
    jsDir: 'src/js',
    sassDir: 'src/sass',
    templateDir: '../templates',
    staticDir: '../static',
    testDir: 'src/test',
    imgDir: 'src/img'
  };

  grunt.initConfig({
    config: config,

    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['bower:install']
      },
      js: {
        files: ['<%= config.jsDir %>/**/*.js'],
        tasks: ['jshint', 'uglify', 'copy'],
        options: {
          livereload: true
        }
      },
      jstest: {
        files: ['<%= config.testDir %>/{,*/}*.js'],
        tasks: ['test:watch']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.templateDir %>/**/*.html',
          '<%= config.imgDir %>/**/*'
        ]
      },
      css: {
        files: ['<%= config.sassDir %>/**/*.scss'],
        tasks: ['sass:dev', 'autoprefixer'],
        options: { spawn: false }
      },
      images: {
        files: ['<%= config.imgDir %>/**/*.{gif,jpeg,jpg,png}'],
        tasks: ['copy']
      }
    },

    connect: {
      options: {
        port: 9002,
        open: true,
        livereload: 35729,
        hostname: 'localhost',
        options: {
          base: {
            keepalive: true
          }
        }
      },
      livereload: {
        options: {
          keepalive: true,
          middleware: function(connect) {
            return [
              connect().use('/static/bower_components', connect.static('./bower_components')),
              connect().use('/static/templates', connect.static('../templates')),
              connect().use('/static', connect.static('../static')),
              connect().use('/dist/img', connect.static('./bower_components/admin-lte/dist/img')),
              connect().use('/endpointmocks', connect.static('endpointmocks')),
              connect.static('../templates')
            ];
          }
        }
      },
      test: {
        options: {
          keepalive: true,
          open: false,
          port: 9003,
          hostname: 'localhost',
          middleware: function(connect) {
            return [
              connect.static('src/test'),
              connect().use('/Static', connect.static('../static')),
              connect().use('/bower_components', connect.static('./bower_components'))
            ];
          }
        }
      }
    },

    sass: {
      options: {
        sourceMap: true,
        outputStyle: 'expanded'
      },
      staticDir: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sassDir %>',
            src: ['**/*.scss'],
            dest: '<%= config.staticDir %>/css',
            ext: '.css'
          }
        ]
      }
    },

    clean: {
      staticDir: {
        options: {
          force: true
        },
        src: [
          '<%= config.staticDir %>/**/*'
        ]
      },
      server: '.tmp'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.jsDir %>/**/*.js',
        '<%= config.testDir %>/**/*.js'
      ]
    },

    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
        }
      }
    },

    uglify: {
      staticDir: {
        files: {
          '<%= config.staticDir %>/js/scheduler.min.js': ['<%= config.jsDir %>/**/*.js']
        },
        options: {
          sourceMap: true,
          mangle: false,
          exapanded: true
        }
      }
    },

    copy: {
      staticDir: {
        files: [
          {
            expand: true,
            dot: true,
            dest: '<%= config.staticDir %>',
            src: [
              '<%= config.imgDir %>'
            ]
          }
        ]
      }
    },
    bower: {
      install: {}
    }
  });


  grunt.registerTask('serve', '', function () {
    grunt.task.run([
      'clean:server',
      'sass:staticDir',
      'connect:livereload',
      'watch'
    ]);
    return grunt.task.run(['build', 'connect:dist:keepalive']);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'sass:staticDir',
        'uglify'
      ]);
    }

    grunt.task.run([
      'connect:test',
      'mocha'
    ]);
  });

  grunt.registerTask('build', [
    'clean:staticDir',
    'bower:install',
    'sass:staticDir',
    'uglify',
    'copy:staticDir'
  ]);

  grunt.registerTask('dev', [
    'watch'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
