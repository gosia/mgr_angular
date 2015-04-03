'use strict';
/* global angular */

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
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/timetable.html',
      scope: false
    };
  }])
  .directive('loadingBox', [function() {
    return {
      restrict: 'A',
      link: function ($scope, $element) {

        var onConditionChange = function(newValue) {
          if (newValue) {
            $element.addClass('box-loading');
          } else {
            $element.removeClass('box-loading');
          }
        };

        onConditionChange(true);

        $scope.$watch(function() { return $scope.loadingIf; }, onConditionChange);
      },
      scope: {
        loadingIf: '=if'
      }
    };
  }]);
