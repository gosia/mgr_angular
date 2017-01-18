'use strict';

angular.module('schedulerApp').controller('TaskController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'Task', '$location', 'Config',
  function (ApiService, $routeParams, $rootScope, $scope, Task, $location, Config) {
    $rootScope.$broadcast('changeContent', 'task', {name: $routeParams.taskId});

    var init = function() {
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        ApiService.getTask($routeParams.taskId).success(function(data) {
          $scope.task = Task.init(data);
          $scope.config.setTimetable(data.timetable);

          ApiService.getTaskRating($routeParams.taskId).success(function(data) {
            $scope.task.rating = data.rating;
          });

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
      return ApiService.startTask($scope.task.id).success(function() {
        $scope.task.status = 'processing';
        $rootScope.$broadcast('addAlertByCode', 'ok');
      });
    };

    init();

    $scope.removeTask = removeTask;
    $scope.startTask = startTask;
  }
]);
