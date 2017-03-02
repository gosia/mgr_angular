'use strict';

angular.module('schedulerApp').controller('ConfigController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'Config', '$location', '$route', 'File',
  'Task', 'Rating', '$q', 'TaskRatingHelper', 'TaskRating', 'Vote',
  function (
    ApiService, $routeParams, $rootScope, $scope, Config, $location, $route, File,
    Task, Rating, $q, TaskRatingHelper, TaskRating, Vote
  ) {
    $scope.configId = $routeParams.configId;

    $scope.reloadFile = function() {
      if ($scope.config.file !== undefined) {
        $scope.file = undefined;
        ApiService.getFile($scope.config.file).success(function(data) {
          $scope.file = File.init(data);
          $rootScope.$broadcast('file_loaded');
        });
      }
    };

    let init = function() {
      $rootScope.$broadcast('changeContent', 'config', {name: $routeParams.configId});
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        $scope.reloadFile();
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    let initRatingData = function() {
      let p1 = ApiService.getTasks().then(function(data) {
        let taskIds = _.map(
          _.filter(data.results, function (x) {
            return x.config_id === $routeParams.configId && x.status === 'finished';
          }),
          x => x.id
        );

        return $q.all(
          _.map(taskIds, x => ApiService.getTask(x))
        ).then(function(tasks) {
          $scope.tasks = _.chain(tasks)
            .filter(x => x.rating_helper)
            .map(data => {
              let task = Task.init(data);
              task.helper = TaskRatingHelper.init($scope.config, data);
              task.setConfig($scope.config);
              return task;
            })
            .value();
        });

      });
      let p2 = ApiService.getRatings().then(function(data) {
        $scope.ratings = _.map(data.results, x => Rating.init(x));
        $scope.ratingsMap = _.object(_.map($scope.ratings, x => [x.id, x]));
      });
      let p3 = ApiService.getVote($routeParams.configId).success(function(data) {
        $scope.vote = Vote.init(data);
      });

      $scope.taskRatings = {};
      $q.all([p1, p2, p3]).then(function() {
        _.each($scope.tasks, task => {
          $scope.taskRatings[task.id] = {};
          $scope.vote.setTask(task);
          task.helper.setVote($scope.vote);

          _.each($scope.ratings, rating => {
            $scope.taskRatings[task.id][rating.id] = new TaskRating(
              task.helper, rating, $scope.config
            );
          });
        });
      });
    };

    init();

    let copyConfigElements = function(type) {
      return function(fromConfigId) {
        ApiService.copyConfigElements(type, $scope.configId, fromConfigId).success(function() {
          $route.reload();
        });
      };
    };

    let removeConfig = function() {
      ApiService.removeConfig($scope.configId).success(function() {
        $location.url('/configs');
      });
    };

    $scope.removeConfig = removeConfig;

    $scope.copyTeachers = copyConfigElements('teacher');
    $scope.copyTerms = copyConfigElements('term');
    $scope.copyRooms = copyConfigElements('room');
    $scope.initRatingData = initRatingData;
  }
]);
