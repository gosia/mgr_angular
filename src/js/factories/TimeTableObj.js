'use strict';
/* global angular */

angular.module('schedulerApp').factory('TimeTableObj', ['Event', function(Event) {
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

  TimeTableObj.prototype.getEvent = function(calendar, tab) {
    var opts = {
      backgroundColor: backgrouundColors[tab.type],
      borderColor: backgrouundColors[tab.type],
      textColor: colors[tab.type]
    };

    return new Event(
      this.term.day,
      this.term.start.hour * 60 + this.term.start.minute,
      this.term.end.hour * 60 + this.term.end.minute,
      calendar,
      this,
      tab,
      opts
    );
  };

  return TimeTableObj;
}]);
