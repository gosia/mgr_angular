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

  Group.init = function(apiData, termsMap, teachersMap) {
    var terms = _.map(apiData.terms, function(termId) { return termsMap[termId]; });
    var teachers = _.map(apiData.teachers, function(teacherId) { return teachersMap[teacherId]; });
    return new Group(
      apiData.id, terms, apiData.terms_num, apiData.students_num, apiData.same_term_groups,
      apiData.diff_term_groups, apiData.labels, teachers, apiData.extra
    );
  };

  return Group;
}]);
