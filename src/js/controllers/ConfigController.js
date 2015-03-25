'use strict';
/* global angular */

angular.module('schedulerApp').controller('ConfigController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Config', '$location',
  function (ApiService, $routeParams, $rootScope, $scope, Config, $location) {
    $scope.configId = $routeParams.configId;

    var init = function() {
      $rootScope.$broadcast('changeContent', 'config', {name: $routeParams.configId});
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    init();
  }
]);
