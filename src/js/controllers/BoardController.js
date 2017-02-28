'use strict';

angular.module('schedulerApp').controller('BoardController', [
  'ApiService', '$routeParams', '$scope', 'Config', 'Teacher', 'Group', 'Room', 'Term', '$timeout',
  'Event', 'Calendar', '$controller',
  function (
    ApiService, $routeParams, $scope, Config, Teacher, Group, Room, Term, $timeout, Event, Calendar,
    $controller
  ) {

    $scope.board = {};
    $scope.$parent.board = $scope.board;

    angular.extend(
      this, $controller('EditMultipleGroupsController', {$scope: $scope})
    );
    angular.extend(
      this, $controller('ObjectModificationController', {$scope: $scope})
    );
    angular.extend(
      this, $controller('BoardNavigationController', {$scope: $scope})
    );
    angular.extend(
      this, $controller('StudentConflictsController', {$scope: $scope})
    );

    let configId, taskId, calendar, termCalendar;

    let init = function() {
      configId = $routeParams.configId;
      taskId = $routeParams.taskId;

      $.AdminLTE.boxWidget.activate();
    };
    init();

    // Calendar handling
    let modifyTimetable = function(data, mode) {
      $scope.config.modifyTimetable(data.timetable, mode);

      let changedRoomIds = _.uniq(_.flatten(
        _.map(data.timetable.results, function(v) {
          return _.map(v, function(vv) { return vv.room; });
        })
      )).filter(function(y) {
        return _.findIndex($scope.activeTabs, function(x) { return x.id === y; }) !== -1;
      });
      let changedGroupIds = _.map(data.timetable.results, function(v, k) { return k; });
      let changedTeacherIds = [];
      _.each(changedGroupIds, function(g) {
        _.each($scope.config.groupsMap[g].teachers, function(x) {
          changedTeacherIds.push(x.id);
        });
      });
      changedTeacherIds = _.uniq(changedTeacherIds).filter(function(y) {
        return _.findIndex($scope.activeTabs, function(x) { return x.id === y; }) !== -1;
      });
      changedGroupIds = changedGroupIds.filter(function(y) {
        return _.findIndex($scope.activeTabs, function(x) { return x.id === y; }) !== -1;
      });

      let tabs = [];
      _.each(changedGroupIds, function(x) { tabs.push($scope.config.groupsMap[x]); });
      _.each(changedTeacherIds, function(x) { tabs.push($scope.config.teachersMap[x]); });
      _.each(changedRoomIds, function(x) { tabs.push($scope.config.roomsMap[x]); });

      calendar.reload(tabs);

    };

    let deletedEventCallback = function(tab, timetableObj) {
      return ApiService
        .removeEvent(taskId, timetableObj)
        .success(function(data) {
          modifyTimetable(data, 'delete');
        });
    };

    let initCalendar = function() {
      calendar = Calendar.init($scope.config, deletedEventCallback);
      calendar.addTabs($scope.activeTabs);
      $scope.calendar = calendar;
    };
    let initTermCalendar = function() {
      termCalendar = Calendar.init($scope.config, deletedEventCallback);
      termCalendar.visibleEventsTypes = ['term'];
      termCalendar.addTabs($scope.config.terms);
      $scope.termCalendar = termCalendar;
    };

    let newEventAddedCallback = function(event, ui) {
      let $target = $(event.target);
      let hour = $target.data('hour');
      let day = $target.data('day');

      let $newPosY = ui.offset.top - $target.offset().top;
      if ($newPosY < 0) {
        hour--;
        $newPosY = (40 + $newPosY);
      }

      let minute = Math.floor(($newPosY * 60) / 40.0);

      let groupId = $(event.toElement).attr('data-id');

      ApiService
        .addEvent(taskId, groupId, day, hour, minute)
        .success(function(data) {
          modifyTimetable(data, 'extend');
        });
    };

    let activateOverflow = function(groupId) {

      ApiService.getBusyTermsForGroup(taskId, groupId).success(function(data) {
        $scope.busyEvents = _.map(data.terms, termId => {
          let t = $scope.config.termsMap[termId];
          return new Event(
            t.day,
            t.start.hour * 60 + t.start.minute,
            t.end.hour * 60 + t.end.minute
          );
          }
        );
      });
    };

    let filterRoom = function(room) {
      if ($scope.filter === undefined || $scope.filter === '') { return true; }
      return _.chain(room.labels).some(x => x.includes($scope.filter)).value() ||
        room.id.includes($scope.filter);
    };
    let filterTeacher = function(teacher) {
      if ($scope.filter === undefined || $scope.filter === '') { return true; }

      return teacher.id.includes($scope.filter) ||
        teacher.extra.firstName.includes($scope.filter) ||
        teacher.extra.lastName.includes($scope.filter);
    };
    let filterGroup = function(group) {
      if ($scope.filter === undefined || $scope.filter === '') { return true; }

      return group.id.includes($scope.filter) ||
        group.extra.course.includes($scope.filter) ||
        _.chain(group.room_labels).some(x => x.includes($scope.filter)).value() ||
        _.chain(group.teachers).some(filterTeacher).value();
    };

    angular.extend($scope.board, {
      initCalendar: initCalendar,
      initTermCalendar: initTermCalendar,
      dropCallback: newEventAddedCallback,

      activateOverflow: activateOverflow,

      filterRoom: filterRoom,
      filterTeacher: filterTeacher,
      filterGroup: filterGroup,

      calendar: calendar,
      termCalendar: termCalendar
    });

    $scope.busyEvents = [];
    $scope.calendar = calendar;
    $scope.termCalendar = termCalendar;
  }
]);
