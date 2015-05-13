'use strict';
/* global angular */

angular.module('schedulerApp')
  .directive('listTerms', [function() {
    return {
      restrict: 'E',
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/terms_list.html',
      link: function($scope) {
        $scope.allOpen = false;
        $scope.allTermsGiven = $scope.terms.length === $scope.config.terms.length;
        $scope.showAllExcept = !$scope.allTermsGiven &&
        4 * $scope.terms.length > 3 * $scope.config.terms.length;
      },
      scope: {
        terms: '=',
        config: '=',
        board: '='
      }
    };
  }]);
