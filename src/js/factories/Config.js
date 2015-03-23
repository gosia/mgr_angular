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

    this.setTermsMap();
    this.setRoomsMap();
    this.setGroupsMap();
    this.setTeachersMap();
  }

  Config.prototype.setTermsMap = function() {
    this.termsMap = _.object(_.map(this.terms, term => [term.id, term]));
  };

  Config.prototype.setRoomsMap = function() {
    this.roomsMap = _.object(_.map(this.rooms, room => [room.id, room]));
  };

  Config.prototype.setGroupsMap = function() {
    this.groupsMap = _.object(_.map(this.groups, group => [group.id, group]));
  };

  Config.prototype.setTeachersMap = function() {
    this.teachersMap = _.object(_.map(this.teachers, teacher => [teacher.id, teacher]));
  };

  Config.init = function(apiData) {
    var terms = _.map(apiData.terms, apiTerm => Term.init(apiTerm));
    var termsMap = _.object(_.map(terms, term => [term.id, term]));
    var teachers = _.map(apiData.teachers, apiTeacher => Teacher.init(apiTeacher, termsMap));
    var teachersMap = _.object(_.map(teachers, teacher => [teacher.id, teacher]));
    var groups = _.map(apiData.groups, apiGroup => Group.init(apiGroup, termsMap, teachersMap));
    var groupsMap = _.object(_.map(groups, group => [group.id, group]));
    _.each(groups, group => group.setGroupObj(groupsMap));

    var rooms = _.map(apiData.rooms, apiRoom => Room.init(apiRoom, termsMap));

    return new Config(apiData.id, terms, teachers, groups, rooms, apiData.year, apiData.term);
  };

  Config.prototype.setTimetable = function(apiData) {
    var config = this;
    var timetable = _.flatten(
      _.map(apiData.results, (vv, k) => {
        return _.map(vv, (v) => {
          return new TimeTableObj(config.groupsMap[k], config.termsMap[v.term], config.roomsMap[v.room]);
        });
      }),
      true
    );

    var timetableByRoomId = _.groupBy(timetable, x => x.room.id);
    var timetableByGroupId = _.groupBy(timetable, x => x.group.id);
    var timetableByTermId = _.groupBy(timetable, x => x.term.id);
    var timetableByTeacherId = {};
    _.each(timetable, x => {
      _.each(x.group.teachers, t => {
        if (timetableByTeacherId[t.id] === undefined) {
          timetableByTeacherId[t.id] = [x];
        } else {
          timetableByTeacherId[t.id].push(x);
        }
      });
    });

    _.each(this.teachers, teacher => teacher.setTimetable(timetableByTeacherId[teacher.id] || []));
    _.each(this.groups, group => group.setTimetable(timetableByGroupId[group.id] || []));
    _.each(this.rooms, room => room.setTimetable(timetableByRoomId[room.id] || []));
    _.each(this.terms, term => term.setTimetable(timetableByTermId[term.id] || []));
  };

  Config.prototype.modifyTimetable = function(apiData, mode) {
    var calendar = this;

    var timetable = _.flatten(
      _.map(apiData.results, (vv, k) => {
        _.map(vv, v => {
          new TimeTableObj(calendar.groupsMap[k], calendar.termsMap[v.term], calendar.roomsMap[v.room]);
        });
      }),
      true
    );

    var timetableByRoomId = _.groupBy(timetable, x => x.room.id);
    var timetableByGroupId = _.groupBy(timetable, x => x.group.id);
    var timetableByTermId = _.groupBy(timetable, x => x.term.id);
    var timetableByTeacherId = {};
    _.each(timetable, x => {
      _.each(x.group.teachers, t => {
        if (timetableByTeacherId[t.id] === undefined) {
          timetableByTeacherId[t.id] = [x];
        } else {
          timetableByTeacherId[t.id].push(x);
        }
      });
    });

    _.each(timetableByRoomId, (v, k) => calendar.roomsMap[k].modifyTimetable(v, mode));
    _.each(timetableByGroupId, (v, k) => calendar.groupsMap[k].modifyTimetable(v, mode));
    _.each(timetableByTermId, (v, k) => calendar.termsMap[k].modifyTimetable(v, mode));
    _.each(timetableByTeacherId, (v, k) => calendar.teachersMap[k].modifyTimetable(v, mode));

  };

  Config.prototype.addTeacher = function(teacher) {
    this.teachers.push(teacher);
    this.setTeachersMap();
  };

  Config.prototype.addGroup = function(group) {
    this.groups.push(group);
    this.setGroupsMap();
  };

  Config.prototype.addRoom = function(room) {
    this.rooms.push(room);
    this.setRoomsMap();
  };

  Config.prototype.addTerm = function(term, apiData) {
    this.terms.push(term);
    this.setTermsMap();

    if (apiData.addForAll) {
      _.each(this.teachers, x => x.terms.push(term));
      _.each(this.groups, x => x.terms.push(term));
    }
  };

  Config.prototype.editTeacher = function(teacher) {
    _.each(this.teachers, x => {
      if (x.id === teacher.id) {
        x.edit(teacher);
      }
    });
  };

  Config.prototype.editGroup = function(group) {
    _.each(this.groups, x => {
      if (x.id === group.id) {
        x.edit(group);
      }
    });
  };

  Config.prototype.editRoom = function(room) {
    _.each(this.rooms, x => {
      if (x.id === room.id) {
        x.edit(room);
      }
    });
  };

  Config.prototype.editTerm = function(term) {
    _.each(this.terms, x => {
      if (x.id === term.id) {
        x.edit(term);
      }
    });
  };

  Config.prototype.removeTeacher = function(teacher) {
    this.teachers = _.filter(this.teachers, x => x.id !== teacher.id);
    _.each(this.groups, g => {
      g.teachers = _.filter(g.teachers, x => x.id !== teacher.id);
    });
    this.setTeachersMap();
  };

  Config.prototype.removeGroup = function(group) {
    this.groups = _.filter(this.groups, x => x.id !== group.id);
    this.setGroupsMap();
  };

  Config.prototype.removeRoom = function(room) {
    this.rooms = _.filter(this.rooms, x => x.id !== room.id);
    this.setRoomsMap();
  };

  Config.prototype.removeTerm = function(term) {
    this.terms = _.filter(this.terms, x => x.id !== term.id);
    _.each(this.groups, g => {
      g.terms = _.filter(g.terms, x => x.id !== term.id);
    });
    _.each(this.teachers, t => {
      t.terms = _.filter(t.terms, x => x.id !== term.id);
    });
    this.setTermsMap();
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

  Config.prototype.findTerms = function(date, howMany) {
    var day=date.day(), hour=date.hour(), minute=date.minute();

    var i = _.findIndex(this.terms, x => x.pointInTerm(day, hour, minute));
    if (i === -1) {
      return undefined;
    }

    var terms = this.terms.slice(i, i + howMany);

    if (_.exists(terms, x => x !== day)) {
      return undefined;
    }
    return terms;
  };

  return Config;
}]);
