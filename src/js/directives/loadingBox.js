'use strict';

angular.module('schedulerApp')
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
