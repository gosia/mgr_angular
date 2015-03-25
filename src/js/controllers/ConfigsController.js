'use strict';
/* global angular, _ */

angular.module('schedulerApp').controller('ConfigsController', ['ApiService', '$rootScope', '$scope', '$location', 'User',
  function (ApiService, $rootScope, $scope, $location, User) {
    $scope.numStart = 0;
    $scope.numEnd = 0;
    $scope.numAll = 0;
    $scope.pages = 0;
    $scope.activaPage = 0;

    $scope.user = User.init();

    var init = function() {
      $rootScope.$broadcast('changeContent', 'configs');

      ApiService.getConfigs().success(function(data) {
        $scope.items = data.results;
        $scope.numStart = data.num_start;
        $scope.numEnd = data.num_end;
        $scope.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1;
        $scope.pages = _.range(1, Math.ceil(data.num_all / pageSize) + 1);
        $scope.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    init();

    var createConfig = function() {
      ApiService
        .createConfig($scope.newConfig.id, $scope.newConfig.year, $scope.newConfig.term)
        .success(function(data) {
          if (data.ok) {
            var url = '/config/' + data.config_id;
            $location.path(url).hash('basic');
          }
        });
    };

    $scope.createConfig = createConfig;
  }
]);
