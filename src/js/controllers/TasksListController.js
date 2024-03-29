'use strict';

angular.module('schedulerApp').controller('TasksListController', [
  'ApiService', '$scope', '$location', 'Task', 'User', '$rootScope',
  function (ApiService, $scope, $location, Task, User, $rootScope) {
    var controller = this;

    controller.numStart = 0;
    controller.numEnd = 0;
    controller.numAll = 0;
    controller.pages = 0;
    controller.activaPage = 0;

    $scope.newTask = {configId: undefined, algorithm: undefined};

    $scope.user = User.init();

    var init = function(configId) {
      $scope.newTask.configId = configId;
      ApiService.getTasks().success(function(data) {
        controller.items = _.map(
          _.filter(data.results, function(x) {
            return configId === undefined || x.config_id === configId;
          }),
          x => Task.init(x)
        );
        controller.numStart = data.num_start;
        controller.numEnd = data.num_end;
        controller.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1, pageNum;
        if (pageSize === 0) {
          pageNum = 1;
        } else {
          pageNum = Math.ceil(data.num_all / pageSize) + 1;
        }
        $scope.pages = _.range(1, pageNum);
        controller.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    var createTask = function() {
      ApiService
        .createTask($scope.newTask.configId, $scope.newTask.algorithm)
        .success(function(data) {
          var url = '/task/' + data.config_id + '/' + data.task_id;
          $location.path(url).hash('basic');
        })
        .error(function() {
          $('#create-task-modal').modal('hide');
        });
    };

    var removeTask = function(taskId) {
      ApiService.removeTask(taskId).success(function() {
        controller.items = _.filter(controller.items, x => x.id !== taskId);
      });
    };

    var startTask = function(task) {
      return ApiService.startTask(task.id).success(function() {
        task.status = 'processing';
        $rootScope.$broadcast('addAlertByCode', 'ok');
      });
    };

    $scope.init = init;
    $scope.createTask = createTask;
    $scope.startTask = startTask;
    $scope.removeTask = removeTask;
  }
]);
