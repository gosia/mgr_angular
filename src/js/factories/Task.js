'use strict';
/*global angular */

angular.module('schedulerApp').factory('Task', [function() {
  function Task(id, configId, algorithm) {
    this.id = id;
    this.configId = configId;
    this.algorithm = algorithm;
  }

  Task.init = function(apiData) {
    return new Task(apiData.id, apiData.config_id, apiData.algorithm);
  };

  return Task;
}]);
