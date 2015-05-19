'use strict';

angular.module('schedulerApp').factory('Room', ['Perms', function(Perms) {
  function Room(id, terms, labels, capacity) {
    this.id = id;
    this.terms = terms;
    this.labels = labels;
    this.capacity = capacity;
    this.type = 'room';
    this.timetable = [];
    this.perms = Perms.init();
  }

  Room.init = function(apiData, termsMap) {
    var terms = _.map(apiData.terms, function(termId) { return termsMap[termId]; });
    return new Room(apiData.id, terms, apiData.labels, apiData.capacity);
  };

  Room.initForModal = function(config, apiData) {
    var formTermIds = apiData.terms ? apiData.terms.split(',') : [];
    var formTerms = _.filter(config.terms, function(x) { return _.contains(formTermIds, x.id); });

    var terms = apiData.allTerms ? config.terms : formTerms;
    var labels = apiData.labels ? apiData.labels.split(',') : [];

    return new Room(apiData.id, terms, labels, apiData.capacity);
  };

  Room.prototype.getShortName = function() {
    return this.id;
  };

  Room.prototype.getTabName = function() {
    return this.getShortName();
  };

  Room.prototype.getLongName = function() {
    return 'Sala ' + this.id;
  };

  Room.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  Room.prototype.modifyTimetable = function(timetable, mode) {
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

  Room.prototype.getForModal = function(config) {
    return {
      id: this.id,
      terms: _.map(this.terms, function(x) { return x.id; }).join(','),
      allTerms: this.terms.length === config.terms.length,
      labels: this.labels.join(','),
      capacity: this.capacity
    };
  };

  Room.prototype.edit = function(room) {
    this.terms = room.terms;
    this.capacity = room.capacity;
    this.labels = room.labels;
  };

  Room.prototype.newEvents = function() {
    return [];
  };

  return Room;
}]);
