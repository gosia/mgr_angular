'use strict';
/*global angular */

angular.module('schedulerApp')
  .directive('contentChange', function() {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $element.bind('click', function (elem) {
          elem.preventDefault();
          $scope.$root.$broadcast('changeContent', $attr.contentChange);
          $('#main-sidebar').find('li').removeClass('active');
          $element.addClass('active');
        });
      }
    };
  });
