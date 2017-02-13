'use strict';
/* globals ace */


angular.module('schedulerApp').controller('FileEditorController', ['$scope', '$timeout', 'ApiService',
  function ($scope, $timeout, ApiService) {

    $scope.data = {changed: false};

    var colorEditor = function() {
      var editor = ace.edit('editor');
      var Range = ace.require('ace/range').Range;

      _.each(_.keys(editor.getSession().getMarkers()), marker => editor.getSession().removeMarker(marker));

      _.each($scope.file.errors, error => {
        editor.getSession().addMarker(
          new Range(error.line - 1, 0, error.line - 1, Infinity), 'ace_highlight-' + error.type, 'fullLine'
        );
      });
    };

    var onTextChange = function() {
      $scope.data.changed = true;
      var editor = ace.edit('editor');
      $scope.file.setContent(editor.getValue()).then(function() {
        $scope.download.recount();
        colorEditor();
      });
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
      editor.setShowPrintMargin(false);
      editor.getSession().on('change', onTextChange);
      colorEditor();
    };

    $scope.$on('file_loaded', function() {
      var editor = ace.edit('editor');
      editor.setValue($scope.file.content);
    });

    var save = function() {
      var editor = ace.edit('editor');
      var newContent = editor.getValue();
      ApiService.saveFile($scope.file.id, newContent).success(function() {
        $scope.file.setContent(newContent);
        $scope.data.changed = false;
      });
    };

    $scope.init = init;
    $scope.save = save;

  }
]);
