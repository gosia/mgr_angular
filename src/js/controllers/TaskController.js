'use strict';
/*global angular */

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

    init();
  }
]);
