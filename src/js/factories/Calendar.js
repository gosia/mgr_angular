'use strict';
/* global angular, _ */

angular.module('schedulerApp').factory('Calendar', ['Event', function(Event) {

  function Calendar(config, deletedCallback) {
    this.config = config;
    this.deletedCallback = deletedCallback;

    this.events = [];

    this.visibleEventsTypes = ['teacher', 'group', 'room'];
  }

  Calendar.prototype.recountOverlappingEvents = function() {
    var sortedEvents = this.events.sort(
      (a, b) => {
        if (a.day < b.day) {
          return -1;
        }
        if (a.day > b.day) {
          return 1;
        }

        if (a.start < b.start || (a.start === b.start && a.end < b.end) ) {
          return -1;
        } else if (a.start === b.start && a.end === b.end) {
          return 0;
        }
        return 1;
      }
    );

    _.each(this.events, event => {
      event.overlappingEvents = 1;
      event.overlappingEventPosition = 1;
    });

    var l = this.events.length;
    var start = 0, end = 0, curEvent;

    while (start < l) {
      curEvent = sortedEvents[start];

      end = start;
      while (end + 1 < l && curEvent.day === sortedEvents[end + 1].day && curEvent.end > sortedEvents[end + 1].start) {
        end++;
        sortedEvents[end].overlappingEvents++;
      }

      curEvent.overlappingEventPosition = curEvent.overlappingEvents;
      curEvent.overlappingEvents += (end - start);

      start++;
    }
  };

  Calendar.prototype.recountBase = function() {
    _.each(this.events, event => event.recountBase());
  };

  Calendar.prototype.removeTab = function(tab) {
    this.events = _.filter(this.events, e => e.tab.id !== tab.id || e.tab.type !== tab.type);
    this.recountOverlappingEvents();
  };

  Calendar.prototype.addTab = function(tab) {
    var events, calendar = this;
    if (_.contains(calendar.visibleEventsTypes, tab.type)) {
      if (tab.type === 'term') {
        events = [Event.getTermEvent(this, tab)];
      } else {
        events = _.map(tab.timetable, t => t.getEvent(this, tab));
      }
    } else {
      events = [];
    }
    this.events = _.uniq(this.events.concat(events), x => x.id);
    this.recountOverlappingEvents();
  };

  Calendar.prototype.addTabs = function(tabs) {
    var calendar = this;
    _.each(tabs, tab => calendar.addTab(tab));
  };

  Calendar.prototype.reload = function(tabs) {
    var calendar = this;
    _.each(tabs, function(x) {
      calendar.removeTab(x);
      calendar.addTab(x);
    });
  };

  Calendar.init = function(id, config, addedCallback, deletedCallback) {
    return new Calendar(id, config, addedCallback, deletedCallback);
  };

  return Calendar;
}]);
