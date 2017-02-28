'use strict';

angular.module('schedulerApp')
  .config([
    '$routeProvider', '$locationProvider', '$interpolateProvider', '$httpProvider', '$sceDelegateProvider',
    function($routeProvider, $locationProvider, $interpolateProvider, $httpProvider, $sceDelegateProvider) {
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
        .when('/files', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/files.html',
          controller: 'FilesController'
        })
        .when('/file/:fileId', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/file.html',
          controller: 'FileController',
          reloadOnSearch: false
        })
        .when('/votes', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/votes.html',
          controller: 'VotesController'
        })
        .when('/vote/:configId', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/vote.html',
          controller: 'VoteController',
          reloadOnSearch: false
        })
        .when('/ratings', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/ratings.html',
          controller: 'RatingsController'
        })
        .when('/rating/:ratingId', {
          templateUrl: window.STATIC_URL + 'django_scheduler/templates/content/rating.html',
          controller: 'RatingController',
          reloadOnSearch: false
        })
        .otherwise({
          redirectTo: '/'
        });

      if (window.STATIC_URL.substr(0, 4) === 'http') {
        $sceDelegateProvider.resourceUrlWhitelist([
          'self',
          window.STATIC_URL + '**'
        ]);
      }
    }
  ]);
