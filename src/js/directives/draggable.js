'use strict';
/* global angular */

angular.module('schedulerApp')
  .directive('draggable', [function() {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $element.draggable({
          cursorAt: {top: 0, left: 99},
          zIndex: 1070,
          revert: true,
          revertDuration: 0
        });
      }
    };
  }]);
