'use strict';
/* global angular */

angular.module('schedulerApp').controller('AreYouSureController', ['$scope',
  function ($scope) {

    var reset = function() {
      $scope.areYouSureText = '';
      $scope.areYouSureAction = function() {};
    };
    reset();

    $scope.$on('openAreYouSure', function (event, text, action) {
      $scope.areYouSureText = text;
      $scope.areYouSureAction = function() {
        action();
        $('#are-you-sure').modal('hide');
        reset();
      };

      $scope.$apply();

      $('#are-you-sure').modal('show');
    });

  }
]);
