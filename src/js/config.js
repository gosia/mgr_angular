'use strict';
/*global angular */

angular.module('schedulerApp')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: '/static/templates/content/default.html'
      })
      .when('/configs', {
        templateUrl: '/static/templates/content/configs.html',
        controller: 'ConfigsController'
      })
      .when('/config/:configId', {
        templateUrl: '/static/templates/content/config.html',
        controller: 'ConfigController'
      })
      .when('/tasks', {
        templateUrl: '/static/templates/content/tasks.html',
        controller: 'TasksController'
      })
      .when('/task/:taskId', {
        templateUrl: '/static/templates/content/task.html',
        controller: 'TaskController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
