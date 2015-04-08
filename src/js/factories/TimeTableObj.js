'use strict';
/* global angular */

angular.module('schedulerApp').factory('TimeTableObj', ['Calendar', function(Calendar) {
  function TimeTableObj(group, term, room) {
    this.group = group;
    this.room = room;
    this.term = term;
  }

  var backgrouundColors = {
    teacher: '#00a65a',
    group: '#f39c12',
    room: '#d2d6de',
    term: '#3c8dbc'
  };

  var colors = {
    teacher: 'white',
    group: 'white',
    room: 'black',
    term: 'white'
  };

  TimeTableObj.prototype.getId = function() {
    return this.group.id + ':' + this.term.id + ':' + this.room.id;
  };

  TimeTableObj.prototype.getEventForTab = function(tab) {
    return {
      title: tab.id,
      start: new Date(Calendar.y, Calendar.m, Calendar.d + this.term.day, this.term.start.hour, this.term.start.minute),
      end: new Date(Calendar.y, Calendar.m, Calendar.d + this.term.day, this.term.end.hour, this.term.end.minute),
      allDay: false,
      backgroundColor: backgrouundColors[tab.type],
      borderColor: backgrouundColors[tab.type],
      textColor: colors[tab.type],
      tabId: tab.id,
      id: this.getId(),
      tab: tab,
      timetableObj: this
    };
  };

  return TimeTableObj;
}]);
