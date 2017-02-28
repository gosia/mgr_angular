'use strict';

angular.module('schedulerApp').controller('BoardNavigationController', [
  'ApiService', '$routeParams', '$scope', '$timeout',
  function (ApiService, $routeParams, $scope, $timeout) {

    let viewsList = [
      {value: 'tabs', label: 'Zakładki'},
      {value: 'custom-calendar', label: 'Kalendarz'}
    ];
    if ($routeParams.taskId !== undefined) {
      $scope.viewsList = viewsList;
    } else {
      $scope.viewsList = [viewsList[0]];
    }

    $scope.activeTabs = [];
    $scope.activeTabI = -1;
    $scope.activeView = viewsList[0];

    $scope.$watch('activeView', function() {
      if ($scope.activeView.value === 'custom-calendar') {
        $timeout(function() {
          $scope.calendar.recountBase();
        }, 500);
      }
    });

    let changeTab = function(i) {
      $scope.activeTabI = i;
      $scope.activeTab = $scope.activeTabs[$scope.activeTabI];
    };

    let removeTab = function(i) {
      let removed = $scope.activeTabs[i];

      $scope.activeTabs.splice(i, 1);

      if (i === $scope.activeTabI) {
        if ($scope.activeTabI !== 0) {
          changeTab(i - 1);
        } else {
          changeTab(i);
        }
      }

      if ($scope.calendar !== undefined) {
        $scope.calendar.removeTab(removed);
      }
    };

    let addTab = function(obj) {
      let i = _.findIndex($scope.activeTabs, x => x.type === obj.type && x.id === obj.id);
      if (i === -1) {
        $scope.activeTabs.push(obj);
        i = $scope.activeTabs.length - 1;

        if ($scope.calendar !== undefined) {
          $scope.calendar.addTab(obj);
        }
      }

      changeTab(i);
    };

    angular.extend($scope.board, {
      changeTab: changeTab,
      removeTab: removeTab,
      addTab: addTab,
    });
  }
]);
