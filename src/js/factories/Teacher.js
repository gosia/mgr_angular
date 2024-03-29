'use strict';

angular.module('schedulerApp').factory('Teacher', ['Perms', function(Perms) {
  function Teacher(id, terms, extra) {
    this.id = id;
    this.terms = terms;
    this.extra = {
      firstName: extra.first_name, lastName: extra.last_name, notes: extra.notes,
      pensum: extra.pensum
    };
    this.type = 'teacher';
    this.timetable = [];
    this.perms = Perms.init();
    this.groups = [];
  }

  Teacher.init = function(apiData, termsMap) {
    var terms = _.map(apiData.terms, function(termId) { return termsMap[termId]; });
    return new Teacher(apiData.id, terms, apiData.extra);
  };

  Teacher.initForModal = function(config, apiData) {
    var formTermIds = (apiData.terms || '').split(',');
    var formTerms = _.filter(config.terms, function(x) {
      return _.contains(formTermIds, x.id);
    });
    var terms = apiData.allTerms ? config.terms : formTerms;
    return new Teacher(apiData.id, terms, apiData.extra);
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
      allTerms: this.terms.length === config.terms.length,
      extra: {
        first_name: this.extra.firstName, last_name: this.extra.lastName, notes: this.extra.notes,
        pensum: this.extra.pensum
      }
    };
  };

  Teacher.prototype.edit = function(teacher) {
    this.terms = teacher.terms;
    this.extra = teacher.extra;
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
