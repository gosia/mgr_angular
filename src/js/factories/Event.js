'use strict';

angular.module('schedulerApp').factory('Event', [function() {
  function Event(day, start, end, calendar, timetableObj, tab, options) {
    this.day = day;
    this.start = start;
    this.end = end;
    this.calendar = calendar;
    this.tab = tab;
    this.timetableObj = timetableObj;
    this.options = options || {};

    this.overlappingEvents = 1;
    this.overlappingEventPosition = 1;

    this.recountBase();

    this.id = day + ':' + start + ':' + end + ':' + (tab === undefined ? '' : tab.id);
  }

  Event.prototype.recountBase = function() {
    let $cell = $('.calendar-day-' + this.day + '.calendar-hour-11');
    this.baseH = $cell.outerHeight();
    this.baseW = $cell.outerWidth();
  };

  Event.prototype.getTitle = function() {
    if (this.timetableObj === undefined) {
      return this.tab.getPrettyName();
    }
    return this.timetableObj.group.extra.course + ' (' + this.timetableObj.group.extra.groupType + ')';
  };

  Event.prototype.getLeftSubTitle = function() {
    if (this.timetableObj === undefined) {
      return '';
    }
    return _.map(this.timetableObj.group.teachers, function(x) { return x.id; }).join(', ');
  };

  Event.prototype.getRightSubTitle = function() {
    if (this.timetableObj === undefined) {
      return '';
    }
    return 's.' + this.timetableObj.room.id;
  };

  let backgroundColors = {
    teacher: '#00a65a',
    group: '#f39c12',
    room: '#d2d6de',
    term: '#3c8dbc'
  };

  let colors = {
    teacher: 'white',
    group: 'white',
    room: 'black',
    term: 'white'
  };

  Event.getTermEvent = function(calendar, tab) {
    let opts = {
      backgroundColor: backgroundColors[tab.type],
      borderColor: backgroundColors[tab.type],
      textColor: colors[tab.type]
    };

    return new Event(
      tab.day,
      tab.start.hour * 60 + tab.start.minute,
      tab.end.hour * 60 + tab.end.minute,
      calendar,
      undefined,
      tab,
      opts
    );
  };

  Event.getStudentConflictEvent = function(day, hour, color) {
    let opts = {
      backgroundColor: color,
      borderColor: '#ddd'
    };

    return new Event(
      day,
      hour * 60,
      (hour + 1) * 60,
      undefined,
      undefined,
      undefined,
      opts
    );
  };

  return Event;
}]);
