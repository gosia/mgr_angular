'use strict';

angular.module('schedulerApp').controller('TaskController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'Task', '$location', 'Config',
  'TaskRatingHelper', 'Rating', 'TaskRating',
  function (
    ApiService, $routeParams, $rootScope, $scope, Task, $location, Config, TaskRatingHelper, Rating,
    TaskRating
  ) {
    $rootScope.$broadcast('changeContent', 'task', {name: $routeParams.taskId});

    var init = function() {
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        ApiService.getTask($routeParams.taskId).success(function(data) {
          $scope.task = Task.init(data);
          $scope.taskRatingHelper = TaskRatingHelper.init($scope.config, data);

          $scope.config.setTimetable(data.timetable);

          ApiService.getTaskRating($routeParams.taskId).success(function(data) {
            $scope.task.rating = data.rating;
          });
          ApiService.getRatings().success(function(data) {
            $scope.ratings = _.map(data.results, x => Rating.init(x));
            $scope.ratingsMap = _.object(_.map($scope.ratings, x => [x.id, x]));
          });

        });
      });

      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    var removeTask = function() {
      ApiService.removeTask($scope.task.id).success(function() {
        $location.url('/tasks');
      });
    };

    var startTask = function() {
      return ApiService.startTask($scope.task.id).success(function() {
        $scope.task.status = 'processing';
        $rootScope.$broadcast('addAlertByCode', 'ok');
      });
    };

    init();

    var openTab = function(obj) {
      $('.nav-tabs a[href="#board"]').tab('show');

      if ($scope.board !== undefined) {
        $scope.board.addTab(obj);
      }
    };

    var onCurrentRatingChange = function() {
      if ($scope.currentRating) {
        $scope.taskRating = new TaskRating($scope.taskRatingHelper, $scope.currentRating);
      } else {
        $scope.taskRating = undefined;
      }
      console.log($scope.taskRating);
    };

    $scope.removeTask = removeTask;
    $scope.startTask = startTask;
    $scope.openTab = openTab;
    $scope.onCurrentRatingChange = onCurrentRatingChange;

  }
]);
