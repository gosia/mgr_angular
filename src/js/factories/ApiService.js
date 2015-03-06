'use strict';
/*global angular */

angular.module('schedulerApp').factory('ApiService', ['$http', function($http) {
  var urls = {
    getConfigs: '/api/configs.json',
    getConfig: '/api/config.json',
    getTasks: '/api/tasks.json',
    getTask: '/api/task.json'
  };
  var service = {urls: urls};

  service.getConfigs = function() {
    return $http.get(service.urls.getConfigs);
  };

  service.getConfig = function() {
    return $http.get(service.urls.getConfig);
  };

  service.getTasks = function() {
    return $http.get(service.urls.getTasks);
  };

  service.getTask = function() {
    return $http.get(service.urls.getTask);
  };

  return service;
}]);
