'use strict';

angular.module('schedulerApp').factory('Group', ['Perms', function(Perms) {

  var groupTypeMap = {
    'w': 'wykład',
    'c': 'ćwiczenia',
    'p': 'pracownia',
    'l': 'pracownia',
    'e': 'repetytorium',
    's': 'seminarium',
    'r': 'ćwicz-prac'
  };


  function Group(id, terms, termsNum, studentsNum, sameTermGroupIds, diffTermGroupIds, labels, teachers, extra) {
    this.id = id;
    this.terms = terms;
    this.termsNum = termsNum;
    this.studentsNum = studentsNum;
    this.sameTermGroupIds = sameTermGroupIds;
    this.diffTermGroupIds = diffTermGroupIds;
    this.labels = labels;
    this.teachers = teachers;
    this.extra = {
      course: extra.course, groupType: extra.group_type, notes: extra.notes,
      groupTypeFull: groupTypeMap[extra.group_type]
    };
    this.type = 'group';
    this.timetable = [];
    this.perms = Perms.init();
  }

  Group.prototype.setGroupObj = function(groupsMap) {
    this.sameTermGroups = _.map(this.sameTermGroupIds, function(groupId) { return groupsMap[groupId]; });
    this.diffTermGroups = _.map(this.diffTermGroupIds, function(groupId) { return groupsMap[groupId]; });
  };

  Group.prototype.getShortName = function() {
    return this.id;
  };

  Group.prototype.getTabName = function() {
    return this.getCourseName();
  };

  Group.prototype.getLongName = function() {
    return 'Grupa ' + this.id + ' (' + this.extra.course + ', ' + this.extra.groupType +  ')';
  };

  Group.prototype.getCourseName = function() {
    return this.extra.course + ' (' + this.extra.groupType + ')';
  };

  Group.prototype.getCourseNameWithTeachers = function() {
    return this.getCourseName() + ' - ' +
      _.map(this.teachers, function(x) { return x.id; }).join(', ');
  };

  Group.prototype.getCourseNameWithTeachersAndId = function() {
    return this.getCourseNameWithTeachers() + ' (grupa ' + this.id + ')';
  };

  Group.prototype.setTimetable = function(timetable) {
    this.timetable = timetable;
  };

  Group.prototype.modifyTimetable = function(timetable, mode) {
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

  Group.prototype.getForModal = function(config) {
    return {
      id: this.id,
      terms: _.map(this.terms, function(x) { return x.id; }).join(','),
      allTerms: this.terms.length === config.terms.length,
      termsNum: this.termsNum,
      studentsNum: this.studentsNum,
      labels: this.labels.join(','),
      teachers: _.map(this.teachers, function(x) { return x.id; }).join(','),
      course: this.extra.course,
      groupType: this.extra.groupType,
      notes: this.extra.notes
    };
  };

  Group.prototype.edit = function(group) {
    this.terms = group.terms;
    this.teachers = group.teachers;
    this.labels = group.labels;
    this.termsNum = group.termsNum;
    this.studentsNum = group.studentsNum;
    this.extra = group.extra;
  };

  Group.prototype.newEvents = function() {
    if (this.timetable.length > 0) {
      return [];
    }
    return [this];
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
    var formTermIds = apiData.terms ? apiData.terms.split(',') : [];
    var formTerms = _.filter(config.terms, function(x) { return _.contains(formTermIds, x.id); });

    var formTeacherIds = apiData.teachers ? apiData.teachers.split(',') : [];
    var formTeachers = _.filter(config.teachers, function(x) { return _.contains(formTeacherIds, x.id); });

    var terms = apiData.allTerms ? config.terms : formTerms;
    var labels = apiData.labels ? apiData.labels.split(',') : [];

    var group = new Group(
      apiData.id, terms, apiData.termsNum, apiData.studentsNum, [], [], labels, formTeachers,
      {course: apiData.course, group_type: apiData.groupType, notes: apiData.notes}
    );
    group.setGroupObj();
    return group;
  };

  return Group;
}]);
