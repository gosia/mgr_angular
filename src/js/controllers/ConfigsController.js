'use strict';
/*global angular, _ */

angular.module('schedulerApp').controller('ConfigsController', ['ApiService', '$rootScope', '$scope', '$location', 'User',
  function (ApiService, $rootScope, $scope, $location, User) {
    var controller = this;

    controller.items = [];
    controller.numStart = 0;
    controller.numEnd = 0;
    controller.numAll = 0;
    controller.pages = 0;
    controller.activaPage = 0;

    $scope.user = User.init();

    var init = function() {
      $rootScope.$broadcast('changeContent', 'configs');

      ApiService.getConfigs().success(function(data) {
        controller.items = data.results;
        controller.numStart = data.num_start;
        controller.numEnd = data.num_end;
        controller.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1;
        controller.pages = _.range(1, Math.ceil(data.num_all / pageSize) + 1);
        controller.activePage = Math.floor(data.num_start / pageSize) + 1;
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
