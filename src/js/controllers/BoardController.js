'use strict';
/*global angular, $, _ */

angular.module('schedulerApp').controller('BoardController', ['ApiService', '$routeParams', '$scope', 'Config',
  function (ApiService, $routeParams, $scope, Config) {
    $scope.activeTabs = [];
    $scope.activeTabI = -1;

    var init = function() {
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        $.AdminLTE.boxWidget.activate();
        $scope.activeTabs = [$scope.config.teachers[0], $scope.config.groups[0], $scope.config.rooms[0]];
        changeTab(0);
      });
    };

    // Tab handling
    var changeTab = function(i) {
      $scope.activeTabI = i;
      $scope.activeTab = $scope.activeTabs[$scope.activeTabI];
    };

    var removeTab = function(i) {
      $scope.activeTabs.splice(i, 1);

      if (i === $scope.activeTabI) {
        if ($scope.activeTabI !== 0) {
          changeTab(i - 1);
        } else {
          changeTab(i);
        }
      }
    };

    var addTab = function(obj) {
      var i = _.findIndex($scope.activeTabs, function(x) { return x.type === obj.type && x.id === obj.id;  });
      if (i === -1) {
        $scope.activeTabs.push(obj);
        i = $scope.activeTabs.length - 1;
      }

      changeTab(i);
    };

    init();

    $scope.changeTab = changeTab;
    $scope.removeTab = removeTab;
    $scope.addTab = addTab;
  }
]);
