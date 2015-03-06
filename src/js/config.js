'use strict';
/*global angular */

angular.module('schedulerApp')
  .config(['$routeProvider', function($routeProvider) {
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
      .otherwise({
        redirectTo: '/'
      });
  }]);
