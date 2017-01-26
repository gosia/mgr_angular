'use strict';

angular.module('schedulerApp').factory('TaskRatingHelper', [function() {
  function TaskRatingHelper(config, ratingHelper) {
    this.config = config;
    this.term = ratingHelper.term_rating_helper;
    this.room = ratingHelper.room_rating_helper;
    this.teacher = ratingHelper.teacher_rating_helper;

    this.teacher.hoursInWorkList = this.getTeacherHours();
    this.teacher.daysInWorkList = this.getTeacherDays();
    this.room.emptyChairGroupsList = this.getRoomEmptyChairs();
    this.term.startEven = _.map(this.term.start_even_groups, x => this.config.groupsMap[x]);
    this.term.startOdd = _.map(this.term.start_odd_groups, x => this.config.groupsMap[x]);
  }

  TaskRatingHelper.init = function(config, apiData) {
    return new TaskRatingHelper(config, apiData.rating_helper);
  };

  TaskRatingHelper.prototype.getTeacherHours = function() {
    var result = [];
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
    var result = [];
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
    var result = [], empty;

    _.each(this.room.empty_chair_groups, (v, emptyChair) => {
      empty = parseInt(emptyChair);
      _.each(v, group => {
        result.push({group: group, empty: empty, groupObject: this.config.groupsMap[group]});
      });
    });

    return result;
  };

  return TaskRatingHelper;
}]);
