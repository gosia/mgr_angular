'use strict';

angular.module('schedulerApp').controller('BoardController', [
  'ApiService', '$routeParams', '$scope', 'Config', 'Teacher', 'Group', 'Room', 'Term', '$timeout',
  'Event', 'Calendar',
  function (
    ApiService, $routeParams, $scope, Config, Teacher, Group, Room, Term, $timeout, Event, Calendar
  ) {
    let viewsList = [
      {value: 'tabs', label: 'Zakładki'},
      {value: 'custom-calendar', label: 'Kalendarz'}
    ];
    $scope.viewsList = [viewsList[0]];

    $scope.activeTabs = [];
    $scope.activeTabI = -1;
    $scope.activeView = viewsList[0];

    let configId, taskId, calendar, termCalendar;

    let init = function() {
      configId = $routeParams.configId;
      taskId = $routeParams.taskId;

      $.AdminLTE.boxWidget.activate();
      $scope.activeTabs = [];

      if (taskId !== undefined) {
          $scope.viewsList = viewsList;
      }

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

    $scope.$watch('activeView', function() {
      if ($scope.activeView.value === 'custom-calendar') {
        $timeout(function() {
          calendar.recountBase();
        }, 500);
      }
    });

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

    // Tab handling
    let changeTab = function(i) {
      $scope.activeTabI = i;
      $scope.activeTab = $scope.activeTabs[$scope.activeTabI];
    };

    let removeTab = function(i) {
      let removed = $scope.activeTabs[i];

      $scope.activeTabs.splice(i, 1);

      if (i === $scope.activeTabI) {
        if ($scope.activeTabI !== 0) {
          changeTab(i - 1);
        } else {
          changeTab(i);
        }
      }

      if (calendar !== undefined) {
        calendar.removeTab(removed);
      }
    };

    let addTab = function(obj) {
      let i = _.findIndex($scope.activeTabs, function(x) { return x.type === obj.type && x.id === obj.id;  });
      if (i === -1) {
        $scope.activeTabs.push(obj);
        i = $scope.activeTabs.length - 1;

        if (calendar !== undefined) {
          calendar.addTab(obj);
        }
      }

      changeTab(i);
    };

    // Changing config
    let resetTeacherForm = function() {
      $scope.newElement = {allTerms: true};
    };

    let resetGroupForm = function() {
      $scope.newElement = {allTerms: true};
    };

    let resetRoomForm = function() {
      $scope.newElement = {allTerms: true};
    };

    let resetTermForm = function() {
      $scope.newElement = {addForAll: true, dayNames: Term.dayNames};
    };

    let datas = {
      teacher: {
        modal: '#add-config-teacher', cls: Teacher, reset: resetTeacherForm,
        apiServiceAddF: ApiService.addConfigTeacher, configAddF: 'addTeacher',
        configEditF: 'editTeacher'
      },
      group: {
        modal: '#add-config-group', cls: Group, reset: resetGroupForm,
        apiServiceAddF: ApiService.addConfigGroup, configAddF: 'addGroup', configEditF: 'editGroup'
      },
      room: {
        modal: '#add-config-room', cls: Room, reset: resetRoomForm,
        apiServiceAddF: ApiService.addConfigRoom, configAddF: 'addRoom', configEditF: 'editRoom'
      },
      term: {
        modal: '#add-config-term', cls: Term, reset: resetTermForm,
        apiServiceAddF: ApiService.addConfigTerm, configAddF: 'addTerm', configEditF: 'editTerm'
      }
    };

    let resetForm = function(form) {
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
    };

    let saveElement = function(type, form) {
      let data = datas[type];

      $(data.modal).modal('hide');
      let mode = $scope.modalModeEdit ? 'edit' : 'add';

      let tab = data.cls.initForModal($scope.config, $scope.newElement);

      data.apiServiceAddF(configId, tab, mode, $scope.newElement).success(function (result) {
        if (result.ok) {
          if (mode === 'add') {
            $scope.config[data.configAddF](tab, $scope.newElement);
          } else {
            $scope.config[data.configEditF](tab, $scope.newElement);
          }
          if (type === 'teacher' || type === 'group') {
            $scope.reloadFile();
          }
          data.reset();
          addTab(tab);
          resetForm(form);
        }
      });

    };

    let openAddModal = function(type) {
      $scope.modalModeAdd = true;
      $scope.modalModeEdit = false;

      let modal = datas[type].modal;
      datas[type].reset();
      $(modal).modal('show');
    };

    let openEditModal = function() {
      $scope.modalModeAdd = false;
      $scope.modalModeEdit = true;

      let elem = $scope.activeTab;
      let data = datas[elem.type];

      $scope.newElement = elem.getForModal($scope.config);
      $(data.modal).modal('show');

    };

    let closeElementModal = function(type, form) {
      let data = datas[type];
      $(data.modal).modal('hide');
      data.reset();
      resetForm(form);
    };

    let removeElement = function(elem) {
      ApiService.removeConfigElement(configId, elem).success(function() {
        $scope.config.removeElement(elem);
        let i = _.findIndex($scope.activeTabs, function(x) { return x.id === elem.id; });
        removeTab(i);

        if (elem.type === 'teacher' || elem.type === 'group') {
          $scope.$parent.reloadFile();
        }
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

    let board = {
      openAddModal: openAddModal,
      openEditModal: openEditModal,
      closeElementModal: closeElementModal,

      saveElement: saveElement,
      removeElement: removeElement,

      changeTab: changeTab,
      removeTab: removeTab,
      addTab: addTab,

      initCalendar: initCalendar,
      initTermCalendar: initTermCalendar,
      dropCallback: newEventAddedCallback,

      activateOverflow: activateOverflow,
      activateOverflowStudentConflicts: activateOverflowStudentConflicts,
      deactivateOverflowStudentConflicts: deactivateOverflowStudentConflicts,

      getBgColor: getBgColor,
      bgSections: bgSections,

      openConflictDetails: openConflictDetails,

      studentConflictsEvents: [],

      calendar: calendar,
      termCalendar: termCalendar
    };

    $scope.board = board;
    $scope.$parent.board = $scope.board;

    $scope.busyEvents = [];
    $scope.calendar = calendar;
    $scope.termCalendar = termCalendar;
  }
]);
