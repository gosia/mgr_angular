'use strict';

angular.module('schedulerApp').controller('StudentConflictsController', [
  '$scope', 'Event', function ($scope, Event) {

    let bgSections = [
      {start: 0, end: 0, color: '#446a12'},
      {start: 1, end: 5, color: '#83bd1a'},
      {start: 6, end: 10, color: '#b2d649'},
      {start: 11, end: 20, color: '#bdd986'},
      {start: 21, end: 30, color: '#ecbfc2'},
      {start: 31, end: 40, color: '#c10000'},
      {start: 41, end: 50, color: '#910010'},
      {start: 51, end: 60, color: '#65000e'},
      {start: 61, end: Infinity, color: '#3c000a'},
    ];

    let getBgColor = function(value) {
      if (value === undefined) {
        return undefined;
      }
      value = Math.round(value);

      let section;

      for (let i=0; i<bgSections.length; i++) {
        section = bgSections[i];
        if (section.start <= value && value <= section.end) {
          return section.color;
        }
      }

      return undefined;
    };

    let openConflictDetails = function(course, day, hour, statsType) {
      let list;
      if (statsType === 'one') {
        list = $scope.vote.stats[course][day * 100 + hour].one_group_list;
      } else {
        list = $scope.vote.stats[course][day * 100 + hour].all_groups_list;
      }

      $scope.conflictDetails = {
        day: day,
        hour: hour,
        list: list
      };
      $('#student-conflict-modal').modal('show');
    };

    let deactivateOverflowStudentConflicts = function() {
      $scope.board.activated.course = undefined;
      $scope.board.activated.statsType = undefined;
      $scope.board.studentConflictsEvents = [];
    };

    let activateOverflowStudentConflicts = function(group, statsType) {
      let course = group.extra.course, points;

      let statsTypeKey;
      if (statsType === 'one') {
        statsTypeKey = 'one_group';
      } else {
        statsTypeKey = 'all_groups';
      }

      $scope.board.activated = {
        course: course,
        statsType: statsType
      };
      $scope.board.studentConflictsEvents = [];
      _.each([0, 1, 2, 3, 4], day => {
        _.each([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], hour => {

          if ($scope.vote.stats[course][day * 100 + hour] === undefined) {
            points = 0;
          } else {
            points = $scope.vote.stats[course][day * 100 + hour][statsTypeKey];
          }
          $scope.board.studentConflictsEvents.push(
            Event.getStudentConflictEvent(
              day,
              hour,
              getBgColor(points)
            )
          );
        });
      });
    };

    angular.extend($scope.board, {
      activateOverflowStudentConflicts: activateOverflowStudentConflicts,
      deactivateOverflowStudentConflicts: deactivateOverflowStudentConflicts,
      openConflictDetails: openConflictDetails,
      getBgColor: getBgColor,
      bgSections: bgSections,
      studentConflictsEvents: []
    });
  }
]);
