'use strict';
/* global angular */

angular.module('schedulerApp').controller('AlertsController', ['$http', '$scope', '$timeout',
  function ($http, $scope) {
    $scope.messages = [];

    var messages = {
      '500': 'Ups! Something went wrong. Please try again.',
      default: 'Ups! Something went wrong. Please try again.'
    };

    var showAlert = function(message) {
      $scope.messages.push(message);
    };

    var showAlertByCode = function(code) {
      var message = messages[code];
      if (message === undefined) {
        message = messages.default;
      }
      showAlert(message);
    };

    $scope.removeMessage = function(i) {
      $scope.messages.splice(i, 1);
    };

    $scope.$on('addAlertByCode', function (event, code) {
      showAlertByCode(code);
    });
    $scope.$on('addAlertByMessage', function (event, message) {
      showAlert(message);
    });

  }
]);
