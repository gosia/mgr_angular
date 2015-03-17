'use strict';
/* global angular */

angular.module('schedulerApp')
  .config(['$routeProvider', '$locationProvider', '$interpolateProvider', function($routeProvider, $locationProvider, $interpolateProvider) {
    $locationProvider.html5Mode(true);
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');

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
        controller: 'ConfigController'
      })
      .when('/tasks', {
        templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/tasks.html',
        controller: 'TasksController'
      })
      .when('/task/:configId/:taskId', {
        templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/task.html',
        controller: 'TaskController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
