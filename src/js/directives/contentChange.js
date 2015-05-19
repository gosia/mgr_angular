'use strict';

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
  }]);
