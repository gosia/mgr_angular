'use strict';
/* global module */
/* global require */


module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-concat');

  var modRewrite = require('connect-modrewrite');

  var config = {
    jsDir: 'src/js',
    sassDir: 'src/sass',
    djangoTemplateDir: '../django_scheduler/templates',
    staticDir: '../django_scheduler/static/django_scheduler',
    buildDir: '.build',
    templateDir: '.build/templates',
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
        tasks: ['jshint', 'concat', 'babel', 'uglify', 'copy'],
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
        options: {
          livereload: true
        }
      },
      images: {
        files: ['<%= config.imgDir %>/**/*.{gif,jpeg,jpg,png}'],
        tasks: ['copy']
      },
      templates: {
        files: ['<%= config.djangoTemplateDir %>/**/*.html'],
        tasks: ['copy:djangoHtml'],
        options: {
          livereload: true
        }
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
              modRewrite([
                '^/api/tasks/$ /api/tasks.json [L]',
                '^/api/task/$ /api/create_task.json [L]',
                '^/api/task/[\\w\\d\\-:]+/$ /api/task.json [L]',
                '^/api/task/[\\w\\d\\-:]+/start/$ /api/default.json [L]',
                '^/api/task/[\\w\\d\\-:]+/add/$ /api/add_event.json [L]',
                '^/api/task/[\\w\\d\\-:]+/remove/$ /api/delete_event.json [L]',

                '^/api/configs/$ /api/configs.json [L]',
                '^/api/config/$ /api/create_config.json [L]',
                '^/api/config/[\\w\\d\\-:]+/$ /api/config.json [L]',
                '^/api/config/[\\w\\d\\-:]+/add/$ /api/default.json [L]',
                '^/api/config/[\\w\\d\\-:]+/remove/$ /api/default.json [L]',
                '^/api/config/[\\w\\d\\-:]+/copy/$ /api/default.json [L]'
              ]),
              function(req, res, next) {
                if (req.method === 'POST' && req.url.substr(0, 4) === '/api') {
                  req.method = 'GET';
                }
                else if (req.method === 'DELETE' && req.url === '/api/task.json') {
                  req.method = 'GET';
                  req.url = '/api/default.json';
                }
                return next();
              },
              connect().use('/static/bower_components', connect.static('./bower_components')),
              connect().use('/grunt/.build', connect.static('./.build')),
              connect().use('/static/django_scheduler/templates', connect.static(config.templateDir)),
              connect().use('/static/django_scheduler', connect.static(config.staticDir)),
              connect().use('/api', connect.static('src/endpointmocks')),
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
      build: '.build'
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
    concat: {
      dist: {
        src: ['<%= config.jsDir %>/**/*.js'],
        dest: '<%= config.buildDir %>/js/scheduler.concat.js'
      }
    },
    babel: {
      options: {
        sourceMap: false
      },
      dist: {
        files: {
          '<%= config.buildDir %>/js/scheduler.babel.js': '<%= config.buildDir %>/js/scheduler.concat.js'
        }
      }
    },
    uglify: {
      staticDir: {
        files: {
          '<%= config.staticDir %>/js/scheduler.min.js': ['<%= config.buildDir %>/js/scheduler.babel.js']
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
          'jquery.min.js': 'jquery/dist/jquery.min.js',
          'bootstrap.min.js': 'admin-lte/bootstrap/js/bootstrap.min.js',
          'angular/angular.min.js': 'angular/angular.min.js',
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
          'admin-lte/AdminLTE.min.css': 'admin-lte/dist/css/AdminLTE.min.css',
          'admin-lte/skin-blue.css': 'admin-lte/dist/css/skins/skin-blue.css',
          'fullcalendar/fullcalendar.min.css': 'admin-lte/plugins/fullcalendar/fullcalendar.min.css',
          'fullcalendar/fullcalendar.print.css': 'admin-lte/plugins/fullcalendar/fullcalendar.print.css'
        }
      },
      fonts: {
        options: {
          destPrefix: '<%= config.staticDir %>/css/fonts'
        },
        files: {
          'glyphicons-halflings-regular.eot': 'admin-lte/bootstrap/fonts/glyphicons-halflings-regular.eot',
          'glyphicons-halflings-regular.svg': 'admin-lte/bootstrap/fonts/glyphicons-halflings-regular.svg',
          'glyphicons-halflings-regular.ttf': 'admin-lte/bootstrap/fonts/glyphicons-halflings-regular.ttf',
          'glyphicons-halflings-regular.woff': 'admin-lte/bootstrap/fonts/glyphicons-halflings-regular.woff',
          'glyphicons-halflings-regular.woff2': 'admin-lte/bootstrap/fonts/glyphicons-halflings-regular.woff2'
        }
      }
    },

    copy: {
      djangoHtml: {
        expand: true,
        cwd: config.djangoTemplateDir,
        dest: '<%= config.templateDir %>/',
        src: ['**'],
        options: {
          process: function (content) {
            return content
              .replace(/{% load staticfiles %}\n/g, '')
              .replace(/{% static '(.*)' %}/g, '/static/$1')
              .replace(/{{ SCHEDULER_BASE_HREF }}/g, 'http://localhost:9002/')
              .replace(/{{ STATIC_URL }}/g, '/static/');
          }
        }
      },
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
    'clean:build',
    'bower:install',
    'sass:staticDir',
    'concat',
    'babel',
    'uglify',
    'copy:staticDir',
    'bowercopy',
    'copy:djangoHtml'
  ]);

  grunt.registerTask('dev', [
    'watch'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
