'use strict';

angular.module('schedulerApp')
  .directive('recountBase', ['$timeout', '$window', function() {
    return {
      restrict: 'A',
      link: function($scope, $element) {
        $element.click(function() {
          $scope.$broadcast('recountBase');
        });
      }
    };
  }]);
