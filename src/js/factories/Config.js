'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('Config', ['Teacher', 'Term', 'Group', 'Room', 'TimeTableObj', function(Teacher, Term, Group, Room, TimeTableObj) {
  function Config(id, terms, teachers, groups, rooms, year, term) {
    this.id = id;
    this.terms = terms;
    this.teachers = teachers;
    this.groups = groups;
    this.rooms = rooms;
    this.year = year;
    this.term = term;
  }

  Config.init = function(apiData) {
    var terms = _.map(apiData.terms, function(apiTerm) { return Term.init(apiTerm); });
    var termsMap = _.object(_.map(terms, function(term) { return [term.id, term]; }));
    var teachers = _.map(
      apiData.teachers, function(apiTeacher) { return Teacher.init(apiTeacher, termsMap); }
    );
    var teachersMap = _.object(_.map(teachers, function(teacher) { return [teacher.id, teacher]; }));
    var groups = _.map(apiData.groups, function(apiGroup) { return Group.init(apiGroup, termsMap, teachersMap); });
    var groupsMap = _.object(_.map(groups, function(group) { return [group.id, group]; }));
    _.each(groups, function(group) { group.setGroupObj(groupsMap); });

    var rooms = _.map(apiData.rooms, function(apiRoom) { return Room.init(apiRoom); });

    return new Config(apiData.id, terms, teachers, groups, rooms, apiData.year, apiData.term);
  };

  Config.prototype.setTimetable = function(apiData) {
    var termsMap = _.object(_.map(this.terms, function(term) { return [term.id, term]; }));
    var roomsMap = _.object(_.map(this.rooms, function(room) { return [room.id, room]; }));
    var groupsMap = _.object(_.map(this.groups, function(group) { return [group.id, group]; }));

    var timetable = _.flatten(
      _.map(apiData.results, function(vv, k) {
        return _.map(vv, function(v){
          return new TimeTableObj(groupsMap[k], termsMap[v.term], roomsMap[v.room]);
        });
      }),
      true
    );

    var timetableByRoomId = _.groupBy(timetable, function(x) { return x.room.id; });
    var timetableByGroupId = _.groupBy(timetable, function(x) { return x.group.id; });
    var timetableByTermId = _.groupBy(timetable, function(x) { return x.term.id; });
    var timetableByTeacherId = {};
    _.each(timetable, function(x) {
      _.each(x.group.teachers, function(t) {
        if (timetableByTeacherId[t.id] === undefined) {
          timetableByTeacherId[t.id] = [x];
        } else {
          timetableByTeacherId[t.id].push(x);
        }
      });
    });

    _.each(this.teachers, function(teacher) { teacher.setTimetable(timetableByTeacherId[teacher.id] || []); });
    _.each(this.groups, function(group) { group.setTimetable(timetableByGroupId[group.id] || []); });
    _.each(this.rooms, function(room) { room.setTimetable(timetableByRoomId[room.id] || []); });
    _.each(this.terms, function(term) { term.setTimetable(timetableByTermId[term.id] || []); });
  };

  return Config;
}]);
