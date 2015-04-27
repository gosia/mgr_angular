'use strict';
/* global angular */

angular.module('schedulerApp').factory('Event', [function() {
  function Event(day, start, end, tab, options) {
    this.day = day;
    this.start = start;
    this.end = end;
    this.tab = tab;
    this.options = options || {};

    this.id = day + ':' + start + ':' + end + ':' + (tab === undefined ? '' : tab.id);
  }

  return Event;
}]);
