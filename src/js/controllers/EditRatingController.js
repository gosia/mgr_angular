'use strict';

/* global angular */

angular.module('schedulerApp').controller('EditRatingController', [
  'ApiService', '$rootScope', '$scope', '$location', '$route',
  function (ApiService, $rootScope, $scope, $location, $route) {

    $scope.too_big_capacity_new_section = 30;
    $scope.total_hours_in_work_new_section = 5;
    $scope.no_work_days_num_new_section = 3;

    $scope.hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    $scope.days = [1, 2, 3, 4, 5, 6, 7];

    $scope.recalculateTerms = function() {
      if ($scope.editRating === undefined) { return; }

      _.each($scope.days, day => {
        _.each($scope.hours, hour => {
          $scope.editRating.term_rating.terms[day + '' + hour] = _.max(
            [$scope.editRating.term_rating.terms_day_bonus[day] + $scope.editRating.term_rating.terms_hour_bonus[hour], 0]
          );
        });
      });
    };

    $scope.removeSection = function(xs, index) {
      if (index - 1 >= 0) {
        xs[index - 1].end = xs[index].end;
      } else if (index + 1 < xs.length) {
        xs[index + 1].start = xs[index].start;
      }
      xs.splice(index, 1);
    };
    $scope.addSection = function(xs, value) {
      var newItem;
      for(var i=0; i<xs.length; i++) {
        var x = xs[i];

        if (x.start < value && x.end < value) {
          continue;
        }
        if (x.end === value) { break; }

        newItem = {
          start: value + 1,
          end: x.end,
          value: 0
        };
        x.end = value;
        break;
      }
      if (newItem !== undefined) {
        xs.push(newItem);
        xs.sort((a, b) => { return a.start > b.start; });
      }
    };

    $scope.recalculateTerms();

    var saveRating = function() {

      var getSectionDict = function(xs) {
        var result = {};
        _.each(xs, x => { result[x.start] = x.value; });
        return result;
      };

      var editRating = {};
      angular.copy($scope.editRating, editRating);
      editRating.room_rating.too_big_capacity = getSectionDict(
        editRating.room_rating.too_big_capacity
      );
      editRating.teacher_rating.total_hours_in_work = getSectionDict(
        editRating.teacher_rating.total_hours_in_work
      );
      editRating.teacher_rating.no_work_days_num = getSectionDict(
        editRating.teacher_rating.no_work_days_num
      );

      console.log(editRating);

      return ApiService
        .saveRating(editRating)
        .success(function() {
          var url = '/rating/' + editRating.id;
          $location.path(url).hash('basic');
          $route.reload();
        });
    };

    $scope.saveRating = saveRating;
  }
]);
