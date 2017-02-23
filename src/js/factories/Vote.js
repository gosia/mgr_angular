'use strict';

angular.module('schedulerApp').factory('Vote', ['Perms', function(Perms) {

  class Vote {
    constructor(configId, studentsNum, pointsNum, votes) {
      this.configId = configId;
      this.studentsNum = studentsNum;
      this.pointsNum = pointsNum;
      this.votes = votes;

      this.votesByStudents = _.groupBy(this.votes, x => x.student);
      this.votesByCourses = _.groupBy(this.votes, x => x.course);

      this.perms = Perms.init();
    }

    static init(apiData) {
      return new Vote(apiData.config_id, apiData.students_num, apiData.points_sum, apiData.votes);
    }

    setConfig(config){
      this.config = config;
      this.initStats();
    }

    initStats() {
      this.stats = {};
      let courses = _.keys(this.votesByCourses);
      _.each(courses, course => { this.stats[course] = this.getCoursePointsByTerm(course); });
    }

    getCoursePointsByTerm(course) {
      let that = this;

      if (that.config === undefined) { return {}; }

      let votesByCourse = _.chain(this.votesByCourses[course])
        .map(x => x.student)
        .uniq()
        .map(x => this.votesByStudents[x])
        .filter(x => x)
        .flatten()
        .groupBy(x => x.course);

      let result = {}, groups, votesTotalPoints, groupTypeGroupsNum, newPoints, students, listValue;
      votesByCourse.each((votes, course) => {
        votesTotalPoints = _.chain(votes).map(x => x.points).reduce((a, b) => a + b, 0);
        students = _.map(votes, x => x.student);
        groups = that.config.groupsByCourse[course];
        _.each(groups, group => {

          _.chain(group.timetable)
            .map(t => t.term.day * 100 + t.term.start.hour)
            .uniq()
            .each(termKey => {

              if (result[termKey] === undefined) {
                result[termKey] = {
                  all_groups: 0, one_group: 0, all_groups_list: [], one_group_list: []
                };
              }

              groupTypeGroupsNum = that.config.groupCountByCourseType[course][group.extra.groupType];
              newPoints = (1 / groupTypeGroupsNum) * votesTotalPoints;
              listValue = {
                students: students,
                group: group,
                course: group.getCourseName(),
                points: votesTotalPoints,
                votes: votes.length,
                sameGroupsNum: groupTypeGroupsNum
              };

              result[termKey].all_groups = result[termKey].all_groups + newPoints;
              result[termKey].all_groups_list.push(listValue);

              if (groupTypeGroupsNum === 1) {
                result[termKey].one_group = result[termKey].one_group + newPoints;
                result[termKey].one_group_list.push(listValue);
              }

            });

        });


      });

      return result;
    }
  }

  return Vote;
}]);
