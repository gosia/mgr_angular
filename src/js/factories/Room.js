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

  Room.prototype.getShortName = function() {
    return this.id;
  };

  Room.prototype.getLongName = function() {
    return 'Sala ' + this.id;
  };

  Room.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  return Room;
}]);
