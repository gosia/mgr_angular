'use strict';

angular.module('schedulerApp').controller('FileController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'File', '$location',
  function (ApiService, $routeParams, $rootScope, $scope, File, $location) {
    $scope.fileId = $routeParams.fileId;

    var init = function() {
      $rootScope.$broadcast('changeContent', 'file', {name: $routeParams.fileId});
      ApiService.getFile($routeParams.fileId).success(function(data) {
        $scope.file = File.init(data);
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    init();

    var removeFile = function() {
      ApiService.removeFile($scope.fileId).success(function() {
        $location.url('/files');
      });
    };

    var linkFile = function() {
      return ApiService.linkFile($scope.file.id).success(function() {
        $scope.file.linked = true;
        $rootScope.$broadcast('addAlertByCode', 'ok');
      });
    };

    $scope.removeFile = removeFile;
    $scope.linkFile = linkFile;
  }
]);
