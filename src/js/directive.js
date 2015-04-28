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
          zIndex: 1070,
          revert: true,
          revertDuration: 0
        });
      }
    };
  }])
  .directive('calendarOverflow', [function() {
    return {
      restrict: 'E',
      templateUrl: window.STATIC_URL + 'django_scheduler/templates/includes/calendar_overflow.html',
      scope: {
        events: '=',
        background: '='
      }
    };
  }])
  .directive('calendarOverflowEvent', [function() {
    return {
      restrict: 'E',
      template: '<a class="event" tabindex="0" role="button"></a>',
      link: function ($scope, $element) {
        var start = $scope.event.start;
        var end = $scope.event.end;

        var h = 40; // height of one hour cell
        var w = 198; // width of one hour cell

        var $event = $element.find('.event');

        // count height of event and top/bottom position
        var s = Math.round(((start - 480) * h) / 60.0);
        var topPx = s + 'px';
        var heightPx = Math.round(((end - start) * h) / 60.0) + 'px';

        $event.css('height', heightPx);
        $event.css('top', topPx);

        // count width and left/right position
        var recountWidth = function($event){
          var cw = Math.floor(w / $scope.event.overlappingEvents);
          var widthPx = cw + 'px';
          var leftPx = (w * $scope.event.day + cw * ($scope.event.overlappingEventPosition - 1)) + 'px';
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

        // set colors and borders
        $event.css('border-radius', '5px');
        if ($scope.event.options.backgroundColor !== undefined) {
          $event.css('background-color', $scope.event.options.backgroundColor);
        }
        if ($scope.event.options.borderColor !== undefined) {
          $event.css('border', '1px solid ' + $scope.event.options.borderColor);
        }
        if ($scope.event.options.textColor !== undefined) {
          $event.css('color', $scope.event.options.textColor);
        }

        // set text
        if ($scope.event.tab !== undefined) {
          $event.append('<div><div class="title">' + $scope.event.getTitle() + '</div><div class="pull-right closeon">x</div></div>');
          $event.append('<div><span>' + $scope.event.getLeftSubTitle() + '</span><span class="pull-right">' + $scope.event.getRightSubTitle() + '</span></div>');

          $event.find('.closeon').click(function() {
            $scope.event.calendar.deletedCallback($scope.event.tab, $scope.event.timetableObj);
          });

          // add popover
          var t = $scope.event.timetableObj;
          var content = '' +
            '<h4>' + t.group.extra.course + ' (' + t.group.extra.groupType + ')</h4><br>' +
            'Prowadzący: ' + _.map(t.group.teachers, x => x.id).join(', ') + '<br>' +
            'Sala: ' + t.room.id + '<br>' +
            'Grupa: ' + t.group.id + '<br>' +
            'Etykiety: ' + t.group.labels.join(', ');

          var options = {
            content: content,
            placement: 'top',
            trigger: 'focus',
            html: true,
            container: 'body'
          };
          $event.popover(options);
        }
      },
      scope: {
        event: '='
      }
    };
  }]);
