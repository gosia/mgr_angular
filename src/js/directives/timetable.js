'use strict';

angular.module('schedulerApp')
  .directive('timetable', ['$interpolate', function() {
    return {
      restrict: 'AE',
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/timetable.html',
      scope: {
        timetable: '=data',
        board: '='
      }
    };
  }]);
