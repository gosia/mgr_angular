'use strict';

angular.module('schedulerApp').factory('Task', ['Perms', function(Perms) {
  function Task(id, configId, algorithm, status) {
    this.id = id;
    this.configId = configId;
    this.algorithm = algorithm;
    this.status = status;

    this.perms = Perms.init();
  }

  Task.init = function(apiData) {
    return new Task(apiData.id, apiData.config_id, apiData.algorithm, apiData.status);
  };

  return Task;
}]);
