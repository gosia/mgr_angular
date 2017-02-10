'use strict';

angular.module('schedulerApp')
  .directive('bindText', [function() {
    var linker = function($scope, $element) {
      $element.innerHtml = $scope.bindText;
    };

    return {
      restrict: 'A',
      scope: {
        bindText: '='
      },
      link: linker
    };
  }]);
