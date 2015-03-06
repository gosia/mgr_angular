'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('Teacher', [function() {
  function Teacher(id, terms) {
    this.id = id;
    this.terms = terms;
    this.type = 'teacher';
  }

  Teacher.init = function(apiData, termsMap) {
    var terms = _.map(apiData.terms, function(termId) { return termsMap[termId]; });
    return new Teacher(apiData.id, terms);
  };

  Teacher.prototype.getShortName = function() {
    return this.id;
  };

  Teacher.prototype.getLongName = function() {
    return 'Nauczyciel ' + this.id;
  };

  return Teacher;
}]);
