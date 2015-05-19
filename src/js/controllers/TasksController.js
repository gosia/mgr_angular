'use strict';

angular.module('schedulerApp').controller('TasksController', ['$rootScope',
  function ($rootScope) {
    $rootScope.$broadcast('changeContent', 'tasks');
  }
]);
