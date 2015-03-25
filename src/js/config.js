'use strict';
/* global angular */

angular.module('schedulerApp')
  .config(['$routeProvider', '$locationProvider', '$interpolateProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $interpolateProvider, $httpProvider) {
      $locationProvider.html5Mode(true);
      $interpolateProvider.startSymbol('{[{').endSymbol('}]}');

      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

      $routeProvider
        .when('/', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/default.html'
        })
        .when('/configs', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/configs.html',
          controller: 'ConfigsController'
        })
        .when('/config/:configId', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/config.html',
          controller: 'ConfigController',
          reloadOnSearch: false
        })
        .when('/tasks', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/tasks.html',
          controller: 'TasksController'
        })
        .when('/task/:configId/:taskId', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/task.html',
          controller: 'TaskController',
          reloadOnSearch: false
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ]);
