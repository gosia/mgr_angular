'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('Config', ['Teacher', 'Term', 'Group', 'Room', function(Teacher, Term, Group, Room) {
  function Config(terms, teachers, groups, rooms) {
    this.terms = terms;
    this.teachers = teachers;
    this.groups = groups;
    this.rooms = rooms;
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

    return new Config(terms, teachers, groups, rooms);
  };

  return Config;
}]);
