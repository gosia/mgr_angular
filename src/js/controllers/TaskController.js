'use strict';
/*global angular */

angular.module('schedulerApp').controller('TaskController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Task',
  function (ApiService, $routeParams, $rootScope, $scope, Task) {
    $rootScope.$broadcast('changeContent', 'task', {name: $routeParams.taskId});

    var init = function() {
      ApiService.getTask($routeParams.taskId).success(function(data) {
        $scope.task = Task.init(data);
      });
    };

    init();
  }
]);
