'use strict';
/* global angular, _ */

angular.module('schedulerApp').factory('Event', [function() {
  function Event(day, start, end, calendar, timetableObj, tab, options) {
    this.day = day;
    this.start = start;
    this.end = end;
    this.calendar = calendar;
    this.tab = tab;
    this.timetableObj = timetableObj;
    this.options = options || {};

    this.id = day + ':' + start + ':' + end + ':' + (tab === undefined ? '' : tab.id);
  }

  Event.prototype.getTitle = function() {
    return this.timetableObj.group.extra.course + ' (' + this.timetableObj.group.extra.groupType + ')';
  };

  Event.prototype.getLeftSubTitle = function() {
    return _.map(this.timetableObj.group.teachers, function(x) { return x.id; }).join(', ');
  };

  Event.prototype.getRightSubTitle = function() {
    return 's.' + this.timetableObj.room.id;
  };

  return Event;
}]);
