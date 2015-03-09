'use strict';
/*global angular */

angular.module('schedulerApp').factory('Task', [function() {
  function Task(id, configId, algorithm, status) {
    this.id = id;
    this.configId = configId;
    this.algorithm = algorithm;
    this.status = status;
  }

  Task.init = function(apiData) {
    return new Task(apiData.id, apiData.config_id, apiData.algorithm, apiData.status);
  };

  return Task;
}]);
