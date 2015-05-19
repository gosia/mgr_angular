'use strict';
/* globals ace */


angular.module('schedulerApp').controller('FileEditorController', ['$scope', '$timeout', 'ApiService',
  function ($scope, $timeout, ApiService) {

    $scope.data = {changed: false};

    var onTextChange = function() {
      $scope.data.changed = true;
      $scope.$apply();
    };

    var init = function() {
      if (window.ace === undefined) {
        $timeout(init, 2000);
        return;
      }
      var editor = ace.edit('editor');
      editor.setTheme('ace/theme/monokai');
      editor.getSession().setMode('ace/mode/text');
      editor.setValue($scope.file.content);
      editor.gotoLine(1);
      editor.getSession().on('change', onTextChange);
    };

    var save = function() {
      var editor = ace.edit('editor');
      var newContent = editor.getValue();
      ApiService.saveFile($scope.fileId, newContent).success(function() {
        $scope.file.content = newContent;
        $scope.data.changed = false;
      });
    };

    $scope.init = init;
    $scope.save = save;

  }
]);
