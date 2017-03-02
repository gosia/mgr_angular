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

    setTask(task) {
      this.config = task.config;
      this.task = task;
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

    getVotesByCoursePairs() {
      let result = {}, sVotes, i, j, key, sVotesLength;
      let students = _.keys(this.votesByStudents);

      _.each(students, student => {
        sVotes = this.votesByStudents[student];
        sVotesLength = sVotes.length;

        for (i = 0; i < sVotesLength; i++) {
          for (j = i+1; j < sVotesLength; j++) {
            key = _.sortBy([sVotes[i].course, sVotes[j].course], x => x).join(';');
            if (result[key] === undefined) {
              result[key] = {
                elems: [],
                points: 0
              };
            }
            result[key].elems.push({
              student: student,
              points: sVotes[i].points + sVotes[j].points,
              votes: [sVotes[i], sVotes[j]]
            });
            result[key].points = result[key].points + sVotes[i].points + sVotes[j].points;
          }
        }

      });
      return result;
    }

    getAllConflicts() {
      let conflictsByCoursePairs = this.getVotesByCoursePairs();

      let result = [], termGroups, i, j, termGroupsLength, key, group1, group2, that = this,
        groupNumScaler;
      _.each(this.config.terms, term => {
        if (this.task.timetableByTerms[term.id] === undefined) {
          return;
        }

        termGroups = _.chain(this.task.timetableByTerms[term.id])
          .map(x => x.group.id).uniq().value();
        termGroupsLength = termGroups.length;

        for (i = 0; i < termGroupsLength; i++) {
          for (j = i+1; j < termGroupsLength; j++) {
            group1 = that.config.groupsMap[termGroups[i]];
            group2 = that.config.groupsMap[termGroups[j]];
            key = _.sortBy([group1.extra.course, group2.extra.course], x => x).join(';');
            if (conflictsByCoursePairs[key] === undefined) {
              continue;
            }

            groupNumScaler = (
                1 / that.config.groupCountByCourseType[group1.extra.course][group1.extra.groupType]
              ) * (
                1 / that.config.groupCountByCourseType[group2.extra.course][group2.extra.groupType]
              );

            result.push({
              term: term,
              termSort: term.day * 100 + term.start.hour,
              group1: group1,
              group2: group2,
              points: conflictsByCoursePairs[key].points * groupNumScaler,
              students: _.chain(conflictsByCoursePairs[key].elems)
                .map(x => x.student)
                .uniq()
                .value()
            });
          }
        }

      });
      return result;
    }
  }

  return Vote;
}]);
