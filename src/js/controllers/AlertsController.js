'use strict';

angular.module('schedulerApp').controller('AlertsController', ['$http', '$scope', '$timeout',
  function ($http, $scope, $timeout) {
    $scope.messages = [];
    var timeouts = [];

    var messages = {
      '500': 'Ups! Coś poszło nie tak. Spróbuj ponownie.',
      default: 'Ups! Coś poszło nie tak. Spróbuj ponownie.',
      ok: 'Yey! Akcja zakończyła się powodzeniem.'
    };

    var showAlert = function(message, code) {
      if (code === undefined) {
        code = 'danger';
      }
      $scope.messages.push({text: message, code: code});
      var timeout = $timeout(function() {
        $scope.messages.splice($scope.messages - 1, 1);
      }, 5000);
      timeouts.push(timeout);
    };

    var showAlertByCode = function(code) {
      var message = messages[code];
      if (message === undefined) {
        message = messages.default;
      }
      if (code === 'ok') {
        showAlert(message, 'success');
      } else {
        showAlert(message);
      }
    };

    $scope.removeMessage = function(i) {
      $scope.messages.splice(i, 1);
      $timeout.cancel(timeouts[i]);
      timeouts.splice(i, 1);
    };

    $scope.$on('addAlertByCode', function (event, code) {
      showAlertByCode(code);
    });
    $scope.$on('addAlertByMessage', function (event, message) {
      showAlert(message);
    });

  }
]);
