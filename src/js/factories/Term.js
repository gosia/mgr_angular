'use strict';

angular.module('schedulerApp').factory('Term', ['Perms', function(Perms) {
  function Term(id, start, end, day) {
    this.id = id;
    this.numId = parseInt(id);
    this.start = start;
    this.end = end;
    this.day = day;
    this.type = 'term';
    this.timetable = [];
    this.perms = Perms.init();
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

  Term.prototype.getDayHumanReadable = function() {
    return dayNames[this.day];
  };

  Term.prototype.getPrettyName = function() {
    return dayNames[this.day] + ' ' + pad2(this.start.hour) + ':' + pad2(this.start.minute) + '-' +
      pad2(this.end.hour) + ':' + pad2(this.end.minute);
  };

  Term.prototype.getShortName = function() {
    return this.id;
  };

  Term.prototype.getTabName = function() {
    return this.getPrettyName();
  };

  Term.prototype.getLongName = function() {
    return 'Termin ' + this.id + ' (' + this.getPrettyName() + ')';
  };

  Term.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  Term.prototype.modifyTimetable = function(timetable, mode) {
    if (mode === 'extend') {
      this.timetable = this.timetable.concat(timetable);
    } else if (mode === 'delete') {
      this.timetable = _.filter(this.timetable, function(x) {
        return !_.some(timetable, function(y) {
          return x.room.id === y.room.id && x.group.id === y.group.id && x.term.id === y.term.id;
        });
      });
    }
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

  Term.prototype.newEvents = function() {
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
