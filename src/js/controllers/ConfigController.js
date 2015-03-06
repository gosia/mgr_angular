'use strict';
/*global angular */

angular.module('schedulerApp').controller('ConfigController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Config',
  function (ApiService, $routeParams, $rootScope, $scope, Config) {
    $rootScope.$broadcast('changeContent', 'config', {name: $routeParams.configId});

    var init = function() {
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
      });
    };

    init();
  }
]);
