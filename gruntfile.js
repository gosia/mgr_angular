'use strict';
/* global module */
/* global require */


module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  var modRewrite = require('connect-modrewrite');
  var fs = require('fs');

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
        tasks: ['jshint', 'js'],
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
        tasks: ['css'],
        options: {
          livereload: true
        }
      },
      images: {
        files: ['<%= config.imgDir %>/**/*.{gif,jpeg,jpg,png}'],
        tasks: ['img']
      },
      templates: {
        files: ['<%= config.djangoTemplateDir %>/**/*.html'],
        tasks: ['html'],
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
                '^/api/task/[\\w\\d\\-:]+/busy_terms/[\\w\\d\\-:]+/$ /api/busy_terms.json [L]',

                '^/api/configs/$ /api/configs.json [L]',
                '^/api/config/$ /api/create_config.json [L]',
                '^/api/config/[\\w\\d\\-:]+/$ /api/config.json [L]',
                '^/api/config/[\\w\\d\\-:]+/add/$ /api/default.json [L]',
                '^/api/config/[\\w\\d\\-:]+/remove/$ /api/default.json [L]',
                '^/api/config/[\\w\\d\\-:]+/copy/$ /api/default.json [L]',
                '^/api/config/[\\w\\d\\-:]+/import/$ /api/default.json [L]',

                '^/api/files/$ /api/files.json [L]',
                '^/api/file/$ /api/create_file.json [L]',
                '^/api/file/[\\w\\d\\-:]+/$ /api/file.json [L]',
                '^/api/file/[\\w\\d\\-:]+/remove/$ /api/default.json [L]',
                '^/api/file/[\\w\\d\\-:]+/save/$ /api/default.json [L]'
              ]),
              function(req, res, next) {
                var regexpes = [
                  '^/config/([\\w\\d\\-:]+)/?$',
                  '^/configs/?$',

                  '^/task/([\\w\\d\\-:]+)/?$',
                  '^/task/([\\w\\d\\-:]+)/([\\w\\d\\-:]+)/?$',
                  '^/tasks/?$',

                  '^/file/([\\w\\d\\-:]+)/?$',
                  '^/files/?$'
                ];
                var urlMatches = false;
                for (var i=0; i<regexpes.length; i++) {
                  var r = new RegExp(regexpes[i]);
                  if (r.test(req.url)) {
                    urlMatches = true;
                    break;
                  }
                }
                
                if (urlMatches) {
                  var index = config.templateDir + '/index.html';
                  fs.readFile(index, function (err, data) {
                    res.end(data);
                  });
                } else {
                  return next();
                }
              },
              function(req, res, next) {
                if (req.method === 'POST' && req.url.substr(0, 4) === '/api') {
                  req.method = 'GET';
                }
                else if (
                  req.method === 'DELETE' &&
                  (req.url === '/api/task.json' || req.url === '/api/config.json')
                ) {
                  req.method = 'GET';
                  req.url = '/api/default.json';
                }
                return next();
              },
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
        sourceMap: false,
        outputStyle: 'expanded'
      },
      compile: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sassDir %>',
            src: ['**/*.scss'],
            dest: '<%= config.buildDir %>/css',
            ext: '.css'
          }
        ]
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: '<%= config.buildDir %>/css',
          src: ['scheduler.css'],
          dest: '<%= config.staticDir %>/css',
          ext: '.css'
        }]
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
      },
      bower1: {
        src: [
          '<%= config.buildDir %>/js/libs/jquery.min.js',
          '<%= config.buildDir %>/js/libs/bootstrap.min.js',
          '<%= config.buildDir %>/js/libs/angular/angular.min.js',
          '<%= config.buildDir %>/js/libs/angular/angular-route.min.js',
          '<%= config.buildDir %>/js/libs/underscore-min.js',
          '<%= config.buildDir %>/js/libs/admin-lte/app.min.js'
        ],
        dest: '<%= config.staticDir %>/js/vendor1.js'
      },
      bower2: {
        src: [
          '<%= config.buildDir %>/js/libs/jquery-ui-1.10.3.min.js'
        ],
        dest: '<%= config.staticDir %>/js/vendor2.js'
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
          sourceMap: false,
          mangle: false,
          exapanded: true
        }
      }
    },

    bowercopy: {
      js: {
        options: {
          destPrefix: '<%= config.buildDir %>/js/libs'
        },
        files: {
          'jquery.min.js': 'jquery/dist/jquery.min.js',
          'bootstrap.min.js': 'admin-lte/bootstrap/js/bootstrap.min.js',
          'angular/angular.min.js': 'angular/angular.min.js',
          'angular/angular-route.min.js': 'angular-route/angular-route.min.js',
          'underscore-min.js': 'underscore/underscore-min.js',
          'admin-lte/app.min.js': 'admin-lte/dist/js/app.min.js',
          'moment-with-locales.min.js': 'moment/min/moment-with-locales.min.js',
          'fullcalendar.min.js': 'admin-lte/plugins/fullcalendar/fullcalendar.min.js',
          'jquery-ui-1.10.3.min.js': 'admin-lte/plugins/jQueryUI/jquery-ui-1.10.3.min.js',
          'ace.js': 'ace-builds/src-min/ace.js'
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
      img: {
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

  grunt.registerTask('css', [
    'sass',
    'cssmin',
    'bowercopy:css'
  ]);

  grunt.registerTask('html', [
    'copy:djangoHtml'
  ]);

  grunt.registerTask('js', [
    'bowercopy:js',
    'concat',
    'babel',
    'uglify'
  ]);

  grunt.registerTask('img', [
    'copy:img'
  ]);

  grunt.registerTask('font', [
    'bowercopy:fonts'
  ]);

  grunt.registerTask('build', [
    'clean:staticDir',
    'clean:build',
    'bower:install',
    'css',
    'js',
    'img',
    'font',
    'html'
  ]);

  grunt.registerTask('dev', [
    'watch'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
