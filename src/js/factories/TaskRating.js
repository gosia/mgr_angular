'use strict';

angular.module('schedulerApp').factory('TaskRating', ['$timeout', 'Rating',
  function($timeout, Rating) {
    function TaskRating(taskRatingHelper, rating, config) {
      this.taskRatingHelper = taskRatingHelper;
      this.rating = rating;
      this.config = config;
      this.teacher = this.countTeacherData();
      this.room = this.countRoomData();
      this.term = this.countTermData();

      let taskRating = this;
      $timeout(function() {
        taskRating.totals = taskRating.countTotals();
      }, 1000);
    }

    TaskRating.prototype.countTotals = function() {
      let totals = {
        allSum: this.teacher.totals.allSum + this.room.totals.allSum + this.term.totals.allSum,
        allMax: this.teacher.totals.allMax + this.room.totals.allMax + this.term.totals.allMax
      };
      totals.allPercent = totals.allSum * 100 / totals.allMax;
      totals.allWeightedPercent = (this.teacher.totals.allPercent * this.rating.weights.teacher_rating +
        this.room.totals.allPercent * this.rating.weights.room_rating +
        this.term.totals.allPercent * this.rating.weights.term_rating) / (
          this.rating.weights.teacher_rating + this.rating.weights.room_rating + this.rating.weights.term_rating
        );
      return totals;
    };

    TaskRating.prototype.countTeacherData = function() {
      let totalHoursInWork = {}, gapHours = {};

      let hoursInWorkMaxPoints = 0;
      _.each(this.rating.teacherRating.total_hours_in_work, s => {
        if (hoursInWorkMaxPoints < s.value) {
          hoursInWorkMaxPoints = s.value;
        }
      });
      let gapHoursMaxPoints = 0;
      _.each(this.rating.teacherRating.gap_hours, s => {
        if (gapHoursMaxPoints < s.value) {
          gapHoursMaxPoints = s.value;
        }
      });
      let daysInWorkMaxPoints = 0;
      _.each(this.rating.teacherRating.no_work_days_num, s => {
        if (daysInWorkMaxPoints < s.value) {
          daysInWorkMaxPoints = s.value;
        }
      });

      let totals = {
        hoursInWorkSum: 0,
        hoursInWorkMax: this.taskRatingHelper.teacher.hoursInWorkList.length * hoursInWorkMaxPoints,
        gapHoursSum: 0,
        gapHoursMax: this.taskRatingHelper.teacher.gapHoursList.length * gapHoursMaxPoints,
        daysInWorkSum: 0,
        daysInWorkMax: this.taskRatingHelper.teacher.daysInWorkList.length * daysInWorkMaxPoints,
        monFriSum: 0,
        monFriMax: this.taskRatingHelper.teacher.daysInWorkList.length *
        this.rating.teacherRating.no_work_days_on_mon_fri
      };
      let points, hours;

      _.each(this.taskRatingHelper.teacher.hoursInWorkList, x => {
        if (totalHoursInWork[x.teacher] === undefined) {
          totalHoursInWork[x.teacher] = {};
        }

        points = undefined;
        _.each(this.rating.teacherRating.total_hours_in_work, s => {
          hours = Math.ceil(x.minutes / 60);
          if (s.start <= hours && hours <= s.end) {
            points = s.value;
          }
        });

        totalHoursInWork[x.teacher][x.day] = points;
        totals.hoursInWorkSum = totals.hoursInWorkSum + points;

      });
      _.each(this.taskRatingHelper.teacher.gap_hours, (value, teacher) => {
        _.each(value, (hours, day) => {
          if (gapHours[teacher] === undefined) {
            gapHours[teacher] = {};
          }

          let points = 0;
          _.each(this.rating.teacherRating.gap_hours, s => {
            if (s.start <= hours && hours <= s.end) {
              points = s.value;
            }
          });

          gapHours[teacher][day] = points;
          totals.gapHoursSum = totals.gapHoursSum + points;
        });
      });

      let totalDaysInWork = {};

      _.each(this.taskRatingHelper.teacher.daysInWorkList, x => {

        points = undefined;
        _.each(this.rating.teacherRating.no_work_days_num, s => {
          if (s.start <= x.days && x.days <= s.end) {
            points = s.value;
          }
        });

        let isMonFriFree = this.taskRatingHelper.teacher.hours_in_work[x.teacher]['0'] === undefined ||
          this.taskRatingHelper.teacher.hours_in_work[x.teacher]['4'] === undefined;
        let monFriPoints = isMonFriFree ? this.rating.teacherRating.no_work_days_on_mon_fri : 0;

        totalDaysInWork[x.teacher] = {
          days: points,
          mon_fri: monFriPoints
        };
        totals.daysInWorkSum = totals.daysInWorkSum + points;
        totals.monFriSum = totals.monFriSum + monFriPoints;

      });

      totals.allSum = totals.daysInWorkSum + totals.hoursInWorkSum + totals.monFriSum +
        totals.gapHoursSum;
      totals.allMax = totals.daysInWorkMax + totals.hoursInWorkMax + totals.monFriMax +
        totals.gapHoursMax;
      totals.allPercent = totals.allSum * 100 / totals.allMax;

      return {
        totalHoursInWork: totalHoursInWork,
        gapHours: gapHours,
        totalDaysInWork: totalDaysInWork,
        totals: totals
      };
    };

    TaskRating.prototype.countRoomData = function() {
      let tooBigCapacity = {};

      let capacityMaxPoints = 0;
      _.each(this.rating.roomRating.too_big_capacity, s => {
        if (capacityMaxPoints < s.value) {
          capacityMaxPoints = s.value;
        }
      });

      let totals = {
        capacitySum: 0,
        capacityMax: this.taskRatingHelper.room.emptyChairGroupsList.length * capacityMaxPoints
      };
      let points;

      _.each(this.taskRatingHelper.room.emptyChairGroupsList, x => {
        if (tooBigCapacity[x.group] === undefined) {
          tooBigCapacity[x.group] = {};
        }

        points = undefined;
        _.each(this.rating.roomRating.too_big_capacity, s => {
          if (s.start <= x.empty && x.empty <= s.end) {
            points = s.value;
          }
        });

        tooBigCapacity[x.group] = points;
        totals.capacitySum = totals.capacitySum + points;

      });

      totals.allSum = totals.capacitySum;
      totals.allMax = totals.capacityMax;
      totals.allPercent = totals.allSum * 100 / totals.allMax;

      return {
        tooBigCapacity: tooBigCapacity,
        totals: totals
      };
    };

    TaskRating.prototype.countTermData = function() {

      let groupCount = this.taskRatingHelper.term.startEven.length +
        this.taskRatingHelper.term.startOdd.length;
      let maxTermsPoints = _.max(_.map(this.rating.termRating.terms, v => v));

      let totals = {
        startEvenSum: this.taskRatingHelper.term.startEven.length * this.rating.termRating.start_even,
        startEvenMax: groupCount * this.rating.termRating.start_even,
        startOddSum: this.taskRatingHelper.term.startOdd.length * this.rating.termRating.start_odd,
        startOddMax: groupCount * this.rating.termRating.start_odd,
        termsSum: 0,
        termsMax: 0
      };

      let termsTable = [];
      _.each(this.config.terms, term => {

        let pointsKey = Rating.getTermKey(term.day, term.start.hour);
        let points = this.rating.termRating.terms[pointsKey];
        if (points === undefined) {
          points = 0;
        }

        _.each(term.timetable, x => {
          termsTable.push({
            points: points,
            term: x.term,
            group: x.group
          });
          totals.termsSum = totals.termsSum + points;
        });

      });

      totals.termsMax = maxTermsPoints * termsTable.length;
      totals.allSum = totals.startEvenSum + totals.startOddSum + totals.termsSum;
      totals.allMax = totals.startEvenMax + totals.startOddMax + totals.termsMax;
      totals.allPercent = totals.allSum * 100 / totals.allMax;

      return {
        totals: totals,
        termsTable: termsTable
      };
    };

    return TaskRating;
  }
]);
