'use strict';

angular.module('schedulerApp').factory('Rating', [
  'Teacher', 'Term', 'Group', 'Room', 'TimeTableObj', 'Perms',
  function(Teacher, Term, Group, Room, TimeTableObj, Perms) {
    function Rating(id, weights, termRating, roomRating, teacherRating) {
      this.id = id;
      this.weights = weights;
      this.termRating = termRating;

      var getSections = function(dict) {
        var result = [];
        var keys = [];

        _.each(dict, (value, key) => {
          keys.push(parseInt(key));
        });
        _.each(dict, (value, key) => {
          var start = parseInt(key);
          result.push({
            start: start,
            end: _.min(_.filter(keys, x => x > start)) - 1,
            value: value
          });
        });
        return _.sortBy(result, x => x.start);
      };

      if (roomRating !== undefined) {
        this.roomRating = {too_big_capacity: getSections(roomRating.too_big_capacity)};
      }
      if (teacherRating !== undefined) {
        this.teacherRating = {
          total_hours_in_work: getSections(teacherRating.total_hours_in_work),
          no_work_days_num: getSections(teacherRating.no_work_days_num),
          no_work_days_on_mon_fri: teacherRating.no_work_days_on_mon_fri
        };
      } else {
        this.teacherRating = {
          total_hours_in_work: [],
          no_work_days_num: [],
          no_work_days_on_mon_fri: 0
        };
      }

      this.perms = Perms.init();
    }

    Rating.init = function(apiData) {
      return new Rating(
        apiData.id, apiData.weights, apiData.term_rating, apiData.room_rating,
        apiData.teacher_rating
      );
    };

    Rating.initForList = function(apiData) {
      return new Rating(apiData.id);
    };

    Rating.prototype.getForForm = function() {
      var result = {};
      result.id = this.id;
      result.weights = this.weights;
      result.term_rating = this.termRating;
      result.room_rating = this.roomRating;
      result.teacher_rating = this.teacherRating;
      return result;
    };

    function pad(num, size) {
      var s = '000000000' + num;
      return s.substr(s.length - size);
    }

    Rating.getTermKey = function(day, hour) {
      return pad(day * 100 + hour, 3);
    };
    Rating.prototype.getTermKey = Rating.getTermKey;

    return Rating;
  }
]);
