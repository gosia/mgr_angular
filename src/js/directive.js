'use strict';
/*global angular */

angular.module('schedulerApp')
  .directive('contentChange', ['$location', function($location) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $element.bind('click', function () {
          $location.path($attr.href);
        });
      }
    };
  }])
  .directive('timetable', [function() {
    return {
      restrict: 'AE',
      templateUrl: '/static/templates/includes/timetable.html',
      scope: {
        timetable: '=data'
      }
    };
  }]);
