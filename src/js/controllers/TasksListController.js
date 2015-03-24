'use strict';
/* global angular, _ */

angular.module('schedulerApp').controller('TasksListController', ['ApiService', '$scope', '$location',
  function (ApiService, $scope, $location) {
    var controller = this;

    controller.items = [];
    controller.numStart = 0;
    controller.numEnd = 0;
    controller.numAll = 0;
    controller.pages = 0;
    controller.activaPage = 0;

    $scope.newTask = {configId: undefined, algorithm: undefined};

    var init = function(configId) {
      $scope.newTask.configId = configId;
      ApiService.getTasks().success(function(data) {
        controller.items = _.filter(data.results, function(x) {
          return configId === undefined || x.config_id === configId;
        });
        controller.numStart = data.num_start;
        controller.numEnd = data.num_end;
        controller.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1;
        controller.pages = _.range(1, Math.ceil(data.num_all / pageSize) + 1);
        controller.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    var createTask = function() {
      ApiService.createTask($scope.newTask.configId, $scope.newTask.algorithm).success(function(data) {
        if (data.ok) {
          var url = '/task/' + data.config_id + '/' + data.task_id;
          $location.path(url).hash('basic');
        }
      });
    };

    var removeTask = function(taskId) {
      ApiService.removeTask(taskId).success(function(data) {
        if (data.ok) {
          controller.items = _.filter(controller.items, x => x.id !== taskId);
        }
      });
    };

    $scope.init = init;
    $scope.createTask = createTask;
    $scope.removeTask = removeTask;
  }
]);
