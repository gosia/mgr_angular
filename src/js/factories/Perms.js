'use strict';

angular.module('schedulerApp').factory('Perms', [function() {

  function Perms () {
    this.edit = true;
    this.add = true;
    this.delete = true;
    this.start = true;
  }

  Perms.init = function() {
    return new Perms();
  };

  return Perms;
}]);
