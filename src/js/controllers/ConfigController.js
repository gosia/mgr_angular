'use strict';
/*global angular */

angular.module('schedulerApp').controller('ConfigController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Config', '$location',
  function (ApiService, $routeParams, $rootScope, $scope, Config, $location) {
    $rootScope.$broadcast('changeContent', 'config', {name: $routeParams.configId});
    $scope.configId = $routeParams.configId;

    var init = function() {
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
