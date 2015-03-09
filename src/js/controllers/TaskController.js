'use strict';
/*global angular */

angular.module('schedulerApp').controller('TaskController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Task', '$location',
  function (ApiService, $routeParams, $rootScope, $scope, Task, $location) {
    $rootScope.$broadcast('changeContent', 'task', {name: $routeParams.taskId});

    var init = function() {
      ApiService.getTask($routeParams.taskId).success(function(data) {
        $scope.task = Task.init(data);
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    init();
  }
]);
