'use strict';
/* global module */
/* global require */


module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-bowercopy');

  var modRewrite = require('connect-modrewrite');

  var config = {
    jsDir: 'src/js',
    sassDir: 'src/sass',
    templateDir: '../django_scheduler/templates',
    staticDir: '../django_scheduler/static/django_scheduler',
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
        tasks: ['sass'],
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
              connect().use('/static/templates', connect.static(config.templateDir)),
              connect().use('/static', connect.static(config.staticDir)),
              connect().use('/api', connect.static('src/endpointmocks')),
              connect().use('/dist/img', connect.static('./bower_components/admin-lte/dist/img')),
              connect.static(config.templateDir),
              modRewrite(['^.*$ /index.html [L]']),
              connect.static(config.templateDir)
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

    bowercopy: {
      js: {
        options: {
          destPrefix: '<%= config.staticDir %>/js/libs'
        },
        files: {
          'jquery.js': 'jquery/dist/jquery.js',
          'bootstrap.min.js': 'admin-lte/bootstrap/js/bootstrap.min.js',
          'angular/angular.js': 'angular/angular.js',
          'angular/angular-route.min.js': 'angular-route/angular-route.min.js',
          'angular/angular-route.min.js.map': 'angular-route/angular-route.min.js.map',
          'underscore-min.js': 'underscore/underscore-min.js',
          'underscore-min.map': 'underscore/underscore-min.map',
          'admin-lte/app.min.js': 'admin-lte/dist/js/app.min.js',
          'moment-with-locales.min.js': 'moment/min/moment-with-locales.min.js',
          'fullcalendar.min.js': 'admin-lte/plugins/fullcalendar/fullcalendar.min.js',
          'jquery-ui-1.10.3.min.js': 'admin-lte/plugins/jQueryUI/jquery-ui-1.10.3.min.js'
        }
      },
      css: {
        options: {
          destPrefix: '<%= config.staticDir %>/css/libs'
        },
        files: {
          'bootstrap.min.css': 'admin-lte/bootstrap/css/bootstrap.min.css',
          'admin-lte/AdminLTE.css': 'admin-lte/dist/css/AdminLTE.css',
          'admin-lte/skin-blue.css': 'admin-lte/dist/css/skins/skin-blue.css',
          'fullcalendar/fullcalendar.min.css': 'admin-lte/plugins/fullcalendar/fullcalendar.min.css',
          'fullcalendar/fullcalendar.print.css': 'admin-lte/plugins/fullcalendar/fullcalendar.print.css'
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
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }

    return grunt.task.run(['build', 'connect:livereload']);
  });

  grunt.registerTask('build', [
    'clean:staticDir',
    'bower:install',
    'sass:staticDir',
    'uglify',
    'copy:staticDir',
    'bowercopy'
  ]);

  grunt.registerTask('dev', [
    'watch'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
