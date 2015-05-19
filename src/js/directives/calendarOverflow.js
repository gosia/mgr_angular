'use strict';

angular.module('schedulerApp')
  .directive('calendarOverflow', ['$timeout', '$window', function($timeout, $window) {
    return {
      restrict: 'E',
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/calendar_overflow.html',
      scope: {
        events: '=',
        background: '=',
        board: '='
      },
      link: function($scope) {

        function recountEventsPositions() {
          $timeout(function() {
            _.each($scope.events, event => event.recountBase());
          }, 800);
        }

        $('[data-toggle="offcanvas"]').click(function() {
          recountEventsPositions();
        });

        angular.element($window).bind('resize', function() {
          recountEventsPositions();
        });

        $scope.$on('recountBase', function() {
          recountEventsPositions();
        });
      }
    };
  }]);
