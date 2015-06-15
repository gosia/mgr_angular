'use strict';

angular.module('schedulerApp').controller('ConfigsController', ['ApiService', '$rootScope', '$scope', '$location', 'User', 'Config',
  function (ApiService, $rootScope, $scope, $location, User, Config) {
    $scope.numStart = 0;
    $scope.numEnd = 0;
    $scope.numAll = 0;
    $scope.pages = 0;
    $scope.activaPage = 0;

    $scope.user = User.init();
    $scope.newConfig = {id: undefined, year: undefined, term: undefined};

    var init = function() {
      $rootScope.$broadcast('changeContent', 'configs');

      ApiService.getConfigs().success(function(data) {
        $scope.items = _.map(data.results, x => Config.initForList(x));
        $scope.numStart = data.num_start;
        $scope.numEnd = data.num_end;
        $scope.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1, pageNum;
        if (pageSize === 0) {
          pageNum = 1;
        } else {
          pageNum = Math.ceil(data.num_all / pageSize) + 1;
        }
        $scope.pages = _.range(1, pageNum);
        $scope.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    init();

    var createConfig = function() {
      ApiService
        .createConfig($scope.newConfig.id, $scope.newConfig.year, $scope.newConfig.term)
        .success(function(data) {
          var url = '/config/' + data.config_id;
          $location.path(url).hash('basic');
        });
    };

    var removeConfig = function(configId) {
      ApiService.removeConfig(configId).success(function() {
        $scope.items = _.filter($scope.items, x => x.id !== configId);
      });
    };

    $scope.createConfig = createConfig;
    $scope.removeConfig = removeConfig;
  }
]);
