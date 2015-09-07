'use strict';

angular.module('schedulerApp').factory('User', [function() {
  function User() {
    this.hasPerm = {
      add_task: true,
      add_config: true,
      add_file: true,
      add_vote: true
    };
  }

  User.init = function() {
    return new User();
  };

  return User;
}]);
