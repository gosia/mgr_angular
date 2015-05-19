'use strict';
/* global angular */

angular.module('schedulerApp').controller('ConfigController', ['ApiService', '$routeParams', '$rootScope', '$scope', 'Config', '$location', '$route',
  function (ApiService, $routeParams, $rootScope, $scope, Config, $location, $route) {
    $scope.configId = $routeParams.configId;

    var init = function() {
      $rootScope.$broadcast('changeContent', 'config', {name: $routeParams.configId});
      ApiService.getConfig($routeParams.configId).success(function(data) {
        $scope.config = Config.init(data);
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    init();

    var copyConfigElements = function(type) {
      return function(fromConfigId) {
        ApiService.copyConfigElements(type, $scope.configId, fromConfigId).success(function(data) {
          if (data.ok) {
            $route.reload();
          }
        });
      };
    };

    var importData = function() {
      ApiService.importData($scope.configId, $scope.importData.data).success(function(data) {
        if (data.ok) {
          $route.reload();
        }
      });
    };

    var removeConfig = function() {
      ApiService.removeConfig($scope.configId).success(function() {
        $location.url('/configs');
      });
    };

    $scope.importData = {execute: importData, data: undefined};
    $scope.removeConfig = removeConfig;

    $scope.copyTeachers = copyConfigElements('teacher');
    $scope.copyTerms = copyConfigElements('term');
    $scope.copyRooms = copyConfigElements('room');
  }
]);
