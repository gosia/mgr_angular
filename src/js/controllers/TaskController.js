'use strict';

angular.module('schedulerApp').controller('TaskController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Task', '$location', 'Config',
  function (ApiService, $routeParams, $rootScope, $scope, Task, $location, Config) {
    $rootScope.$broadcast('changeContent', 'task', {name: $routeParams.taskId});

    var init = function() {
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        ApiService.getTask($routeParams.taskId).success(function(data) {
          $scope.task = Task.init(data);
          $scope.config.setTimetable(data.timetable);
        });
      });

      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    var removeTask = function() {
      ApiService.removeTask($scope.task.id).success(function() {
        $location.url('/tasks');
      });
    };

    var startTask = function() {
      ApiService.startTask($scope.task.id).success(function(data) {
        if (data.ok) {
          $scope.task.status = 'processing';
        }
      });
    };

    init();

    $scope.removeTask = removeTask;
    $scope.startTask = startTask;
  }
]);
