'use strict';

angular.module('schedulerApp').controller('TaskController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'Task', '$location', 'Config',
  'TaskRatingHelper', 'Rating', 'TaskRating', 'Download', 'FileSaver', 'Blob', '$route',
  'Vote',
  function (
    ApiService, $routeParams, $rootScope, $scope, Task, $location, Config, TaskRatingHelper, Rating,
    TaskRating, Download, FileSaver, Blob, $route, Vote
  ) {
    $rootScope.$broadcast('changeContent', 'task', {name: $routeParams.taskId});

    $scope.downloadTypes = [
      {id: 'teacher', 'text': 'Nauczycieli', filename: 'PlanNauczycieli.txt'},
      {id: 'room', 'text': 'Sal', filename: 'PlanSal.txt'},
      {id: 'course', 'text': 'Przedmiotów', filename: 'PlanPrzedmiotów.txt'},
      {id: 'term', 'text': 'Terminami', filename: 'PlanTerminami.txt'}
    ];
    $scope.currentDownloadType = $scope.downloadTypes[0];

    let init = function() {
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        ApiService.getTask($routeParams.taskId).success(function(data) {
          $scope.task = Task.init(data);
          $scope.task.setConfig($scope.config);

          if (data.rating_helper && _.size(data.rating_helper) > 0) {
            $scope.taskRatingHelper = TaskRatingHelper.init($scope.config, data);
          }

          $scope.config.setTimetable(data.timetable);
          $scope.download = new Download($scope.config);

          ApiService.getTaskRating($routeParams.taskId).success(function(data) {
            $scope.task.rating = data.rating;
          });
          ApiService.getRatings().success(function(data) {
            $scope.ratings = _.map(data.results, x => Rating.init(x));
            $scope.ratingsMap = _.object(_.map($scope.ratings, x => [x.id, x]));
          });
          ApiService.getVote($routeParams.configId).success(function(data) {
            $scope.vote = Vote.init(data);
            $scope.vote.setTask($scope.task);
            $scope.taskRatingHelper.setVote($scope.vote);
          });
        });
      });

      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    let removeTask = function() {
      ApiService.removeTask($scope.task.id).success(function() {
        $location.url('/tasks');
      });
    };

    let startTask = function() {
      return ApiService.startTask($scope.task.id).success(function() {
        $scope.task.status = 'processing';
        $rootScope.$broadcast('addAlertByCode', 'ok');
        $route.reload();
      });
    };

    init();

    let openTab = function(obj) {
      $('.nav-tabs a[href="#board"]').tab('show');

      if ($scope.board !== undefined) {
        $scope.board.addTab(obj);
      }
    };

    let onCurrentRatingChange = function() {
      if ($scope.currentRating) {
        $scope.taskRating = new TaskRating($scope.taskRatingHelper, $scope.currentRating, $scope.task);
      } else {
        $scope.taskRating = undefined;
      }
    };

    let downloadTypesMap = _.object(_.map($scope.downloadTypes, x => [x.id, x]));
    let downloadType = function(type) {
      let text = $scope.download.text[type];
      let data = new Blob([text], {type: 'text/plain;charset=utf-8'});
      FileSaver.saveAs(data, downloadTypesMap[type].filename);
    };

    let downloadOne = function() {
      downloadType($scope.currentDownloadType.id);
    };
    let downloadAll = function() {
      _.each(downloadTypesMap, (_, x) => downloadType(x));
    };

    $scope.removeTask = removeTask;
    $scope.startTask = startTask;
    $scope.openTab = openTab;
    $scope.onCurrentRatingChange = onCurrentRatingChange;
    $scope.downloadOne = downloadOne;
    $scope.downloadAll = downloadAll;

  }
]);
