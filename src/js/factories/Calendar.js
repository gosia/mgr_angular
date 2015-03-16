'use strict';
/* global angular, moment, _ */

angular.module('schedulerApp').factory('Calendar', [function () {

  function Calendar(id, config, addedCallback) {
    this.id = id;
    this.$selector = $(id);
    this.config = config;
    this.addedCallback = addedCallback;
  }

  Calendar.d = 2;
  Calendar.m = 1;
  Calendar.y = 2015;

  Calendar.prototype.init = function() {
    var d = 2, m = 1, y = 2015;
    var calendar = this;
    calendar.$selector.fullCalendar({
      defaultView: 'schedulerAgenda',
      defaultDate: new Date(y, m, d),
      header: {
        left: '',
        center: '',
        right: ''
      },
      start: '2015-03-02 08:00:00',
      intervalStart: '2015-03-02 08:00:00',
      views: {
        schedulerAgenda: {
          type: 'agenda',
          duration: {days: 5},
          buttonText: 'scheduler',
          allDaySlot: false,
          slotDuration: '00:30:00',
          minTime: '08:00:00',
          maxTime: '22:00:00',
          firstDay: 1,
          axisFormat: 'hh:mm',
          columnFormat: 'dddd'
        }
      },
      events: [],
      editable: true,
      droppable: true,
      drop: function(date) {
        calendar.addedCallback(date, $(this).data('id'));
      }
    });
  };

  Calendar.prototype.removeTab = function(tab) {
    this.$selector.fullCalendar('removeEvents', function(event) { return event.tabId === tab.id; });
  };

  Calendar.prototype.addTab = function(tab) {
    var calendar = this;
    _.each(tab.timetable, function(x) {
      calendar.$selector.fullCalendar('renderEvent', x.getEventForTab(tab));
    });
  };

  Calendar.prototype.addTabs = function(tabs) {
    var calendar = this;
    _.each(tabs, function(tab) { calendar.addTab(tab); });
  };

  Calendar.init = function(id, config, addedCallback) {
    var calendar = new Calendar(id, config, addedCallback);
    moment.locale('pl');

    calendar.init();

    return calendar;
  };

  return Calendar;
}]);
