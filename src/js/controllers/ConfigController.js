'use strict';

angular.module('schedulerApp').controller('ConfigController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Config', '$location', '$route', 'File',
  function (ApiService, $routeParams, $rootScope, $scope, Config, $location, $route, File) {
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
  }
]);
