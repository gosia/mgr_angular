'use strict';
/* global angular */

angular.module('schedulerApp')
  .directive('droppable', [function() {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $element.droppable({
          drop: function(event, ui){
            $scope.dropCallback(event, ui);
          }
        });
      },
      scope: {
        dropCallback: '='
      }
    };
  }]);
