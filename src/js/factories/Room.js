'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('Room', [function() {
  function Room(id, terms, labels, capacity) {
    this.id = id;
    this.terms = terms;
    this.labels = labels;
    this.capacity = capacity;
    this.type = 'room';
    this.timetable = [];
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

  Room.prototype.getLongName = function() {
    return 'Sala ' + this.id;
  };

  Room.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
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

  return Room;
}]);
