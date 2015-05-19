'use strict';

angular.module('schedulerApp')
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
        if (event.tab !== undefined && event.timetableObj === undefined) {
          $event.append('<div><div class="title">' + event.getTitle() + '</div></div>');
        }
        if (event.tab !== undefined && event.timetableObj !== undefined) {
          var closeon = '<div class="pull-right closeon" text="\'Na pewno chcesz to usunąć ?\'" action="event.calendar.deletedCallback(event.tab, event.timetableObj)" data-are-you-sure>x</div>';
          $event.append('<div><div class="title">' + event.getTitle() + '</div>' + closeon + '</div>');
          $event.append('<div><span>' + event.getLeftSubTitle() + '</span><span class="pull-right">' + event.getRightSubTitle() + '</span></div>');

          $compile($event.contents())($scope);

          $event.find('.closeon').click(function(event) {
            event.stopPropagation();
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
