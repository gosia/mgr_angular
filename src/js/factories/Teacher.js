'use strict';
/* global angular, _ */

angular.module('schedulerApp').factory('Teacher', ['Perms', function(Perms) {
  function Teacher(id, terms) {
    this.id = id;
    this.terms = terms;
    this.type = 'teacher';
    this.timetable = [];
    this.perms = Perms.init();
    this.groups = [];
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

  Teacher.prototype.getTabName = function() {
    return this.getShortName();
  };

  Teacher.prototype.getLongName = function() {
    return 'Nauczyciel ' + this.id;
  };

  Teacher.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  Teacher.prototype.modifyTimetable = function(timetable, mode) {
    if (mode === 'extend') {
      this.timetable = this.timetable.concat(timetable);
    } else if (mode === 'delete') {
      this.timetable = _.filter(this.timetable, function(x) {
        return !_.some(timetable, function(y) {
          return x.room.id === y.room.id && x.group.id === y.group.id && x.term.id === y.term.id;
        });
      });
    }
  };

  Teacher.prototype.getForModal = function(config) {
    return {
      id: this.id,
      terms: _.map(this.terms, function(x) { return x.id; }).join(','),
      allTerms: this.terms.length === config.terms.length
    };
  };

  Teacher.prototype.edit = function(teacher) {
    this.terms = teacher.terms;
  };

  Teacher.prototype.setGroups = function(groups) {
    this.groups = groups || [];
  };

  Teacher.prototype.newEvents = function() {
    var events = [];

    var groupIds = _.uniq(_.map(this.timetable, x => x.group.id));

    _.each(this.groups, group => {
        if (!_.some(groupIds, x => x === group.id)) {
          events.push(group);
        }
      }
    );

    return events;

  };

  return Teacher;
}]);
