'use strict';

angular.module('schedulerApp').factory('File', ['Perms', function(Perms) {
  function File(id, year, linked, content) {
    this.id = id;
    this.year = year;
    this.linked = linked;
    this.content = content;

    this.perms = Perms.init();
  }


  File.init = function(apiData) {
    return new File(apiData.id, apiData.year, apiData.linked, apiData.content);
  };

  File.initForList = function(apiData) {
    return new File(apiData.id, apiData.year, apiData.linked, undefined);
  };

  return File;
}]);
