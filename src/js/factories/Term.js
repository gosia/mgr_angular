'use strict';
/*global angular */

angular.module('schedulerApp').factory('Term', [function() {
  function Term(id, start, end, day) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.day = day;
    this.type = 'term';
    this.timetable = [];
  }

  var dayNames = {
    0: 'pn',
    1: 'wt',
    2: 'sr',
    3: 'czw',
    4: 'pt',
    5: 'sb',
    6: 'nd'
  };

  function pad2(num) {
    return ('00' + num).substr(-2, 2);
  }

  Term.init = function(apiData) {
    return new Term(apiData.id, apiData.start, apiData.end, apiData.day);
  };

  Term.initForModal = function(config, apiData) {
    return new Term(
      apiData.id,
      {hour: apiData.startHour, minute: apiData.startMinute},
      {hour: apiData.endHour, minute: apiData.endMinute},
      parseInt(apiData.day)
    );
  };

  Term.prototype.getPrettyName = function() {
    return dayNames[this.day] + ' ' + pad2(this.start.hour) + ':' + pad2(this.start.minute) + '-' +
      pad2(this.end.hour) + ':' + pad2(this.end.minute);
  };

  Term.prototype.getShortName = function() {
    return this.id;
  };

  Term.prototype.getLongName = function() {
    return 'Termin ' + this.id + ' (' + this.getPrettyName() + ')';
  };

  Term.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  Term.prototype.extendTimetable = function(timetable) {
    this.timetable = this.timetable.concat(timetable);
  };

  Term.prototype.getForModal = function() {
    return {
      id: this.id,
      startHour: this.start.hour,
      startMinute: this.start.minute,
      endHour: this.end.hour,
      endMinute: this.end.minute,
      day: this.day + '',
      addForAll: true,
      dayNames: dayNames
    };
  };

  Term.prototype.edit = function(term) {
    this.start = term.start;
    this.end = term.end;
    this.day = term.day;
  };

  Term.prototype.events = function() {
    return [];
  };

  Term.prototype.pointInTerm = function(day, hour, minute) {
    return day === this.day &&
      (this.start.hour < hour || (this.start.hour === hour && this.start.minute <= minute)) &&
      (hour < this.end.hour || (hour === this.end.hour && minute <= this.end.minute));
  };

  Term.dayNames = dayNames;

  return Term;
}]);
