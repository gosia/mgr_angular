'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('Group', [function() {
  function Group(id, terms, termsNum, studentsNum, sameTermGroupIds, diffTermGroupIds, labels, teachers, extra) {
    this.id = id;
    this.terms = terms;
    this.termsNum = termsNum;
    this.studentsNum = studentsNum;
    this.sameTermGroupIds = sameTermGroupIds;
    this.diffTermGroupIds = diffTermGroupIds;
    this.labels = labels;
    this.teachers = teachers;
    this.extra = {course: extra.course, groupType: extra.group_type};
    this.type = 'group';
    this.timetable = [];
  }

  Group.prototype.setGroupObj = function(groupsMap) {
    this.sameTermGroups = _.map(this.sameTermGroupIds, function(groupId) { return groupsMap[groupId]; });
    this.diffTermGroups = _.map(this.diffTermGroupIds, function(groupId) { return groupsMap[groupId]; });
  };

  Group.prototype.getShortName = function() {
    return this.id;
  };

  Group.prototype.getLongName = function() {
    return 'Grupa ' + this.id + ' (' + this.extra.course + ', ' + this.extra.groupType +  ')';
  };

  Group.prototype.isATeacher = function(teacherId) {
    return _.some(this.teachers, function(x) { return x.id === teacherId; });
  };

  Group.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  Group.init = function(apiData, termsMap, teachersMap) {
    var terms = _.map(apiData.terms, function(termId) { return termsMap[termId]; });
    var teachers = _.map(apiData.teachers, function(teacherId) { return teachersMap[teacherId]; });
    return new Group(
      apiData.id, terms, apiData.terms_num, apiData.students_num, apiData.same_term_groups,
      apiData.diff_term_groups, apiData.labels, teachers, apiData.extra
    );
  };

  Group.initForModal = function(config, apiData) {
    var formTermIds = (apiData.terms || '').split(',');
    var formTerms = _.filter(config.terms, function(x) { return _.contains(formTermIds, x.id); });

    var formTeacherIds = (apiData.teachers || '').split(',');
    var formTeachers = _.filter(config.teachers, function(x) { return _.contains(formTeacherIds, x.id); });

    var terms = apiData.allTerms ? config.terms : formTerms;
    var labels = (apiData.labels || '').split(',');

    return new Group(
      apiData.id, terms, apiData.termsNum, apiData.studentsNum, [], [], labels, formTeachers,
      {course: apiData.course, group_type: apiData.groupType}
    );
  };

  return Group;
}]);
