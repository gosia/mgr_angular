'use strict';

angular.module('schedulerApp').controller('FilesController', [
  'ApiService', '$rootScope', '$scope', '$location', 'User', 'File', '$route',
  function (ApiService, $rootScope, $scope, $location, User, File, $route) {
    $scope.numStart = 0;
    $scope.numEnd = 0;
    $scope.numAll = 0;
    $scope.pages = 0;
    $scope.activaPage = 0;

    $scope.user = User.init();
    $scope.newFile = {id: undefined, year: undefined};

    var init = function() {
      $rootScope.$broadcast('changeContent', 'files');

      ApiService.getFiles().success(function(data) {
        $scope.items = _.map(data.results, x => File.initForList(x));
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

    var createFile = function() {
      ApiService
        .createFile($scope.newFile.id, $scope.newFile.year)
        .success(function(data) {
          var url = '/file/' + data.file_id;
          $location.path(url).hash('basic');
        });
    };

    var removeFile = function(fileId) {
      ApiService.removeFile(fileId).success(function() {
        $scope.items = _.filter($scope.items, x => x.id !== fileId);
      });
    };

    var linkFile = function(file) {
      return ApiService.linkFile(file.id).success(function() {
        file.linked = true;
        $rootScope.$broadcast('addAlertByCode', 'ok');
        $route.reload();
      });
    };

    $scope.createFile = createFile;
    $scope.removeFile = removeFile;
    $scope.linkFile = linkFile;
  }
]);
