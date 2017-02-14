'use strict';

angular.module('schedulerApp').controller('FileController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', 'File', '$location', 'FileDownload',
  'FileSaver', 'Blob', '$route',
  function (
    ApiService, $routeParams, $rootScope, $scope, File, $location, FileDownload, FileSaver, Blob,
    $route
  ) {
    $scope.fileId = $routeParams.fileId;

    $scope.downloadTypes = [
      {id: 'teacher', 'text': 'Nauczycieli', filename: 'PrzydziałNauczycieli.txt'},
      {id: 'course', 'text': 'Przedmiotów', filename: 'PrzydziałPrzedmiotów.txt'}
    ];
    $scope.currentDownloadType = $scope.downloadTypes[0];

    let init = function() {
      $rootScope.$broadcast('changeContent', 'file', {name: $routeParams.fileId});
      ApiService.getFile($routeParams.fileId).success(function(data) {
        $scope.file = File.init(data);
        $scope.download = new FileDownload($scope.file);
      });
      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    init();

    let removeFile = function() {
      ApiService.removeFile($scope.fileId).success(function() {
        $location.url('/files');
      });
    };

    let linkFile = function() {
      return ApiService.linkFile($scope.file.id).success(function() {
        $scope.file.linked = true;
        $rootScope.$broadcast('addAlertByCode', 'ok');
        $route.reload();
      });
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

    $scope.removeFile = removeFile;
    $scope.linkFile = linkFile;
    $scope.downloadOne = downloadOne;
    $scope.downloadAll = downloadAll;
  }
]);
