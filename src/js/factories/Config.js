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

  Config.prototype.addTeacher = function(teacher) {
    this.teachers.push(teacher);
  };

  Config.prototype.addGroup = function(group) {
    this.groups.push(group);
  };

  Config.prototype.addRoom = function(room) {
    this.rooms.push(room);
  };

  Config.prototype.addTerm = function(term, apiData) {
    this.terms.push(term);

    if (apiData.addForAll) {
      _.each(this.teachers, function(x) {
        x.terms.push(term);
      });
      _.each(this.groups, function(x) {
        x.terms.push(term);
      });
    }
  };

  Config.prototype.removeTeacher = function(teacher) {
    this.teachers = _.filter(this.teachers, function(x) { return x.id !== teacher.id; });
    _.each(this.groups, function(g) {
      g.teachers = _.filter(g.teachers, function(x) { return x.id !== teacher.id; });
    });
  };

  Config.prototype.removeGroup = function(group) {
    this.groups = _.filter(this.groups, function(x) { return x.id !== group.id; });
  };

  Config.prototype.removeRoom = function(room) {
    this.rooms = _.filter(this.rooms, function(x) { return x.id !== room.id; });
  };

  Config.prototype.removeTerm = function(term) {
    this.terms = _.filter(this.terms, function(x) { return x.id !== term.id; });
    _.each(this.groups, function(g) {
      g.terms = _.filter(g.terms, function(x) { return x.id !== term.id; });
    });
    _.each(this.teachers, function(t) {
      t.terms = _.filter(t.terms, function(x) { return x.id !== term.id; });
    });
  };

  Config.prototype.removeElement = function(elem) {
    var mapper = {
      teacher: 'removeTeacher',
      group: 'removeGroup',
      room: 'removeRoom',
      term: 'removeTerm'
    };
    return this[mapper[elem.type]](elem);
  };

  return Config;
}]);
