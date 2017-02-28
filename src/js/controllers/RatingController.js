'use strict';

angular.module('schedulerApp').controller('RatingController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'Rating', '$location',
  function (ApiService, $routeParams, $rootScope, $scope, Rating, $location) {
    $scope.ratingId = $routeParams.ratingId;

    $scope.recalculateTerms = function() {
      if ($scope.editRating === undefined) { return; }

      _.each(
        $scope.editRating.term_rating.terms,
        (v, k) => delete $scope.editRating.term_rating.terms[k]
      );

      _.each($scope.days, day => {
        _.each($scope.hours, hour => {
          $scope.editRating.term_rating.terms[Rating.getTermKey(day, hour)] = _.max(
            [
              $scope.editRating.term_rating.terms_day_bonus[day] +
              $scope.editRating.term_rating.terms_hour_bonus[hour],
              0
            ]
          );
        });
      });
    };

    let init = function() {
      $rootScope.$broadcast('changeContent', 'rating', {name: $routeParams.ratingId});
      ApiService.getRating($routeParams.ratingId).success(function(data) {
        $scope.rating = Rating.init(data);
        $scope.editRating = $scope.rating.getForForm();
        $scope.recalculateTerms();
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    init();

    let removeRating = function() {
      return ApiService.removeRating($scope.ratingId).success(function() {
        $location.url('/ratings');
      });
    };

    $scope.hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    $scope.days = [0, 1, 2, 3, 4, 5, 6];

    let openEditModal = function() {
      $scope.editRating = $scope.rating.getForForm();
      $('#edit-rating-modal').modal('show');
    };

    $scope.removeRating = removeRating;
    $scope.openEditModal = openEditModal;
  }
]);
