'use strict';
/* global angular, _ */

angular.module('schedulerApp')
  .directive('contentChange', ['$location', function($location) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $element.bind('click', function () {
          $location.path($attr.href);
        });
      }
    };
  }])
  .directive('timetable', [function() {
    return {
      restrict: 'AE',
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/timetable.html',
      scope: false
    };
  }])
  .directive('loadingBox', [function() {
    return {
      restrict: 'A',
      link: function ($scope, $element) {

        var onConditionChange = function(newValue) {
          if (newValue) {
            $element.addClass('box-loading');
          } else {
            $element.removeClass('box-loading');
          }
        };

        onConditionChange(true);

        $scope.$watch(function() { return $scope.loadingIf; }, onConditionChange);
      },
      scope: {
        loadingIf: '=if'
      }
    };
  }])
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
  }])
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
  }])
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

      }
    };
  }])
  .directive('calendarOverflowEvent', ['$compile', function($compile) {
    return {
      restrict: 'E',
      template: '<a class="event" tabindex="0" role="button"></a>',
      link: function ($scope, $element) {
        var event = $scope.event;
        var start = event.start;
        var end = event.end;

        var $event = $element.find('.event');

        // count height of event and top/bottom position
        var recountHeight = function($event) {
          var s = Math.round(((start - 480) * event.baseH) / 60.0);
          var topPx = s + 'px';
          var heightPx = Math.round(((end - start) * event.baseH) / 60.0) + 'px';

          $event.css('height', heightPx);
          $event.css('top', topPx);
        };
        recountHeight($event);

        // count width and left/right position
        var recountWidth = function($event){
          var cw = Math.floor(event.baseW / $scope.event.overlappingEvents);
          var widthPx = cw + 'px';

          var lp = _.reduce(
            _.times($scope.event.day, x => $('.calendar-day-' + x + '.calendar-hour-11').outerWidth()),
            (s, x) => s + x,
            0
          );
          var leftPx = (lp + cw * ($scope.event.overlappingEventPosition - 1)) + 'px';
          $event.css('width', widthPx);
          $event.css('left', leftPx);
        };
        recountWidth($event);

        // recalculate changes
        $scope.$watch('event.overlappingEventPosition', function() {
          recountWidth($event);
        });
        $scope.$watch('event.overlappingEvents', function() {
          recountWidth($event);
        });
        $scope.$watch('event.baseW', function() {
          recountWidth($event);
        });
        $scope.$watch('event.baseH', function() {
          recountHeight($event);
        });

        // set colors and borders
        if (event.options.backgroundColor !== undefined) {
          $event.css('background-color', $scope.event.options.backgroundColor);
        }
        if (event.options.borderColor !== undefined) {
          $event.css('border', '1px solid ' + $scope.event.options.borderColor);
        }
        if (event.options.textColor !== undefined) {
          $event.css('color', $scope.event.options.textColor);
        }

        // set text
        if (event.tab !== undefined) {
          $event.append('<div><div class="title">' + event.getTitle() + '</div><div class="pull-right closeon">x</div></div>');
          $event.append('<div><span>' + event.getLeftSubTitle() + '</span><span class="pull-right">' + event.getRightSubTitle() + '</span></div>');

          $event.find('.closeon').click(function(event) {
            event.stopPropagation();
            event.calendar.deletedCallback($scope.event.tab, $scope.event.timetableObj);
          });

          // add popover
          var t = event.timetableObj;
          var content = '' +
            '<h4>' + t.group.extra.course + ' (' + t.group.extra.groupType + ')</h4><br>' +
            'Prowadzący: <span>' +
            '              <span ng-repeat="t in event.timetableObj.group.teachers">' +
            '                <a ng-click="board.addTab(t)">{[{ t.id }]}</a>{[{ $last ? "" : ", " }]}' +
            '              </span>' +
            '            </span><br>' +
            'Sala: <a ng-click="board.addTab(event.timetableObj.room)">{[{ event.timetableObj.room.id }]}</a><br>' +
            'Grupa: <a ng-click="board.addTab(event.timetableObj.group)">{[{ event.timetableObj.group.id }]}</a><br>' +
            'Etykiety: ' + t.group.labels.join(', ');

          var compiledContent = $compile(content)($scope);
          var options = {
            content: compiledContent,
            placement: 'top',
            trigger: 'manual',
            html: true,
            container: 'body'
          };

          $event.popover(options);
          $event.on('click', function() {
            $event.popover('toggle');
          }).on('focusout', function(){
            $event.popover('hide');
          });
        }
      },
      scope: {
        event: '=',
        board: '='
      }
    };
  }]);
