'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('Teacher', [function() {
  function Teacher(id, terms) {
    this.id = id;
    this.terms = terms;
    this.type = 'teacher';
    this.timetable = [];
  }

  Teacher.init = function(apiData, termsMap) {
    var terms = _.map(apiData.terms, function(termId) { return termsMap[termId]; });
    return new Teacher(apiData.id, terms);
  };

  Teacher.initForModal = function(config, apiData) {
    var formTermIds = (apiData.terms || '').split(',');
    var formTerms = _.filter(config.terms, function(x) {
      return _.contains(formTermIds, x.id);
    });
    var terms = apiData.allTerms ? config.terms : formTerms;
    return new Teacher(apiData.id, terms);
  };

  Teacher.prototype.getShortName = function() {
    return this.id;
  };

  Teacher.prototype.getLongName = function() {
    return 'Nauczyciel ' + this.id;
  };

  Teacher.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  return Teacher;
}]);
