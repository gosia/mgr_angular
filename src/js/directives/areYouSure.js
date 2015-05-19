'use strict';

angular.module('schedulerApp')
  .directive('areYouSure', ['$rootScope', function($rootScope) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $element.click(function() {
          $rootScope.$broadcast('openAreYouSure', $scope.text, $scope.action);
        });
      },
      scope: {
        text: '=',
        action: '&'
      }
    };
  }]);
