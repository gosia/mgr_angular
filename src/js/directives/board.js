'use strict';

angular.module('schedulerApp')
  .directive('board', ['$interpolate', function() {
    return {
      restrict: 'E',
      controller: 'BoardController',
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/board.html',
    };
  }]);
