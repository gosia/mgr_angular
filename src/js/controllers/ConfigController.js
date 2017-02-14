'use strict';

angular.module('schedulerApp').controller('ConfigController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'Config', '$location', '$route', 'File',
  'Task', 'Rating', '$q', 'TaskRatingHelper', 'TaskRating',
  function (
    ApiService, $routeParams, $rootScope, $scope, Config, $location, $route, File,
    Task, Rating, $q, TaskRatingHelper, TaskRating
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

    var init = function() {
      $rootScope.$broadcast('changeContent', 'config', {name: $routeParams.configId});
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
        $scope.reloadFile();
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    var initRatingData = function() {
      var p1 = ApiService.getTasks().then(function(data) {
        var taskIds = _.map(
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
              var task = Task.init(data);
              task.helper = TaskRatingHelper.init($scope.config, data);
              return task;
            })
            .value();
        });

      });
      var p2 = ApiService.getRatings().then(function(data) {
        $scope.ratings = _.map(data.results, x => Rating.init(x));
        $scope.ratingsMap = _.object(_.map($scope.ratings, x => [x.id, x]));
      });

      $scope.taskRatings = {};
      $q.all([p1, p2]).then(function() {
        _.each($scope.tasks, task => {
          $scope.taskRatings[task.id] = {};

          _.each($scope.ratings, rating => {
            $scope.taskRatings[task.id][rating.id] = new TaskRating(
              task.helper, rating, $scope.config
            );
          });
        });
      });
    };

    init();

    var copyConfigElements = function(type) {
      return function(fromConfigId) {
        ApiService.copyConfigElements(type, $scope.configId, fromConfigId).success(function() {
          $route.reload();
        });
      };
    };

    var removeConfig = function() {
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
