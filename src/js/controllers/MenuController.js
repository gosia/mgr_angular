'use strict';
/*global angular */

angular.module('schedulerApp').controller('MenuController', ['$http', '$rootScope', '$scope',
  function ($http, $rootScope, $scope) {
    var controller = this;
    controller.data = {};

    $scope.changeContent = function (name) {
      $rootScope.$broadcast('changeContent', name);
    };

    $scope.init = function (menuUrl) {
      $http.get(menuUrl).success(function (data) {
        controller.data = data;
        setTimeout(function(){
          $('.sidebar .treeview').tree();
        }, 1000);
      });
    };
  }
]);
