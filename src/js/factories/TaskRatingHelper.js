'use strict';

angular.module('schedulerApp').factory('TaskRatingHelper', [function() {
  function TaskRatingHelper(config, ratingHelper) {
    this.config = config;
    this.term = ratingHelper.term_rating_helper;
    this.room = ratingHelper.room_rating_helper;
    this.teacher = ratingHelper.teacher_rating_helper;
    this.student = {};

    this.teacher.hoursInWorkList = this.getTeacherHours();
    this.teacher.gapHoursList = this.getGapHours();
    this.teacher.daysInWorkList = this.getTeacherDays();
    this.room.emptyChairGroupsList = this.getRoomEmptyChairs();
    this.term.startEven = _.map(this.term.start_even_groups, x => this.config.groupsMap[x]);
    this.term.startOdd = _.map(this.term.start_odd_groups, x => this.config.groupsMap[x]);
  }

  TaskRatingHelper.init = function(config, apiData) {
    return new TaskRatingHelper(config, apiData.rating_helper);
  };

  TaskRatingHelper.prototype.getGapHours = function() {
    let result = [];
    _.each(this.teacher.gap_hours, (values, teacher) => {
      _.each(values, (hours, day) => {
        result.push({
          teacher: teacher,
          hours: hours,
          day: day,
          teacherObject: this.config.teachersMap[teacher]
        });
      });
    });
    return result;
  };
  TaskRatingHelper.prototype.getTeacherHours = function() {
    let result = [];
    _.each(this.teacher.hours_in_work, (v, teacher) => {
      _.each(v, (minutes, day) => {
        result.push({
          teacher: teacher, day: day, minutes: minutes,
          teacherObject: this.config.teachersMap[teacher]
        });
      });
    });
    return result;
  };
  TaskRatingHelper.prototype.getTeacherDays = function() {
    let result = [];
    _.each(this.teacher.hours_in_work, (v, teacher) => {
      result.push({
        teacher: teacher,
        days: _.size(v),
        teacherObject: this.config.teachersMap[teacher]
      });
    });
    return result;
  };
  TaskRatingHelper.prototype.getRoomEmptyChairs = function() {
    let result = [], empty;

    _.each(this.room.empty_chair_groups, (v, emptyChair) => {
      empty = parseInt(emptyChair);
      _.each(v, group => {
        result.push({group: group, empty: empty, groupObject: this.config.groupsMap[group]});
      });
    });

    return result;
  };
  TaskRatingHelper.prototype.setVote = function(vote) {
    this.vote = vote;
    this.student.conflictsList = vote.getAllConflicts();
    this.student.conflictsSum = _.chain(this.student.conflictsList)
      .map(x => x.points)
      .reduce((a, b) => a + b, 0)
      .value();
  };

  return TaskRatingHelper;
}]);
