'use strict';

/* global angular */

angular.module('schedulerApp').controller('RatingsController', [
  'ApiService', '$rootScope', '$scope', '$location', 'User', 'Rating',
  function (ApiService, $rootScope, $scope, $location, User, Rating) {
    $scope.numStart = 0;
    $scope.numEnd = 0;
    $scope.numAll = 0;
    $scope.pages = 0;
    $scope.activaPage = 0;

    $scope.user = User.init();
    $scope.editRating = {
      id: undefined,
      weights: {
        term_rating: 1,
        room_rating: 1,
        teacher_rating: 1,
        student_rating: 1
      },
      term_rating: {
        terms: {},
        start_even: 2,
        start_odd: 0,
        terms_hour_bonus: {
          8: 0, 9: 0,
          10 : 1, 11 : 1, 12 : 1, 13 : 1, 14 : 1, 15 : 1,
          16 : 0, 17 : 0,
          18 : -1, 19 : -1, 20 : -1
        },
        terms_day_bonus: {0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: -2, 6: -2}
      },
      room_rating: {
        too_big_capacity: [
          {start: 0, end: 10, value: 2},
          {start: 11, end: 20, value: 1},
          {start: 21, end: Infinity, value: 0}
        ]
      },
      teacher_rating: {
        total_hours_in_work: [
          {start: 0, end: 8, value: 2},
          {start: 9, end: Infinity, value: 0}
        ],
        no_work_days_num: [
          {start: 0, end: 0, value: 0},
          {start: 1, end: Infinity, value: 2}
        ],
        gap_hours: [
          {start: 0, end: 0, value: 1},
          {start: 1, end: Infinity, value: 0}
        ],
        no_work_days_on_mon_fri: 1
      }
    };
    $scope.too_big_capacity_new_section = 30;
    $scope.total_hours_in_work_new_section = 5;
    $scope.no_work_days_num_new_section = 3;
    $scope.gap_hours_new_section = 4;

    $scope.hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    $scope.days = [0, 1, 2, 3, 4, 5, 6];

    var init = function() {
      $rootScope.$broadcast('changeContent', 'ratings');

      ApiService.getRatings().success(function(data) {
        $scope.items = _.map(data.results, x => Rating.initForList(x));
        $scope.numStart = data.num_start;
        $scope.numEnd = data.num_end;
        $scope.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1, pageNum;
        if (pageSize === 0) {
          pageNum = 1;
        } else {
          pageNum = Math.ceil(data.num_all / pageSize) + 1;
        }
        $scope.pages = _.range(1, pageNum);
        $scope.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    init();

    var removeRating = function(ratingId) {
      return ApiService.removeRating(ratingId).success(function() {
        $scope.items = _.filter($scope.items, x => x.id !== ratingId);
      });
    };

    $scope.removeRating = removeRating;
  }
]);
