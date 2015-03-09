'use strict';
/*global angular */

angular.module('schedulerApp').factory('ApiService', ['$http', function($http) {
  var urls = {
    getConfigs: '/api/configs.json',
    getConfig: '/api/config.json',
    createConfig: '/api/create_config.json',
    getTasks: '/api/tasks.json',
    getTask: '/api/task.json',
    createTask: '/api/create_task.json'
  };
  var service = {urls: urls};

  service.getConfigs = function() {
    return $http.get(service.urls.getConfigs);
  };

  service.getConfig = function(configId) {
    return $http.get(service.urls.getConfig, {config_id: configId});
  };

  service.createConfig = function(id, year, term) {
    return $http.get(service.urls.createConfig, {id: id, year: year, term: term});
  };

  service.getTasks = function() {
    return $http.get(service.urls.getTasks);
  };

  service.getTask = function(taskId) {
    return $http.get(service.urls.getTask, {task_id: taskId});
  };

  service.createTask = function(configId, algorithm) {
    return $http.get(service.urls.createTask, {config_id: configId, algorithm: algorithm});
  };

  return service;
}]);
