'use strict';
/*global angular */

angular.module('schedulerApp').factory('Task', [function() {
  function Task(id, configId) {
    this.id = id;
    this.configId = configId;
  }

  Task.init = function(apiData) {
    return new Task(apiData.id, apiData.config_id);
  };

  return Task;
}]);
