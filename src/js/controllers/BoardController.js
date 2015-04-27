'use strict';
/* global angular, $, _ */

angular.module('schedulerApp').controller('BoardController', ['ApiService', '$routeParams', '$scope', 'Config', 'Calendar', 'Teacher', 'Group', 'Room', 'Term', '$timeout',
  function (ApiService, $routeParams, $scope, Config, Calendar, Teacher, Group, Room, Term, $timeout) {
    var viewsList = [
      {value: 'tabs', label: 'Zakładki'},
      {value: 'calendar', label: 'Kalendarz'},
      {value: 'custom-calendar', label: 'Nowy kalendarz'}
    ];
    $scope.viewsList = [viewsList[0]];

    $scope.activeTabs = [];
    $scope.activeTabI = -1;
    $scope.activeView = viewsList[0];

    var calendar, configId, taskId;

    var init = function() {
      configId = $routeParams.configId;
      taskId = $routeParams.taskId;

      $.AdminLTE.boxWidget.activate();
      $scope.activeTabs = [];

      if (taskId !== undefined) {
          $scope.viewsList = viewsList;
      }

    };

    // Calendar handling
    var initCalendar = function() {
      calendar = Calendar.init('#calendar', $scope.config, newEventAdded, deletedEventCallback);
      calendar.addTabs($scope.activeTabs);
    };

    function initEvents() {
      $.AdminLTE.boxWidget.activate();
    }

    $scope.$watch('activeView', function(newValue) {
      if (newValue.value === 'calendar') {
        $timeout(function() {
          initEvents();
        }, 1000);
      }
    });

    var modifyTimetable = function(data, mode) {
      if (data.ok) {
        $scope.config.modifyTimetable(data.timetable, mode);


        var changedRoomIds = _.uniq(_.flatten(
          _.map(data.timetable.results, function(v) {
            return _.map(v, function(vv) { return vv.room; });
          })
        )).filter(function(y) {
          return _.findIndex($scope.activeTabs, function(x) { return x.id === y; }) !== -1;
        });
        var changedGroupIds = _.map(data.timetable.results, function(v, k) { return k; });
        var changedTeacherIds = [];
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

        var tabs = [];
        _.each(changedGroupIds, function(x) { tabs.push($scope.config.groupsMap[x]); });
        _.each(changedTeacherIds, function(x) { tabs.push($scope.config.teachersMap[x]); });
        _.each(changedRoomIds, function(x) { tabs.push($scope.config.roomsMap[x]); });

        calendar.reload(tabs);
        initEvents();

      }
    };

    var newEventAdded = function(date, groupId) {
      ApiService
        .addEvent(taskId, groupId, date.day() - 1, date.hour(), date.minute())
        .success(function(data) {
          modifyTimetable(data, 'extend');
        });
    };

    var deletedEventCallback = function(tab, timetableObj) {
      ApiService
        .removeEvent(taskId, timetableObj)
        .success(function(data) {
          modifyTimetable(data, 'delete');
        });
    };

    // Tab handling
    var changeTab = function(i) {
      $scope.activeTabI = i;
      $scope.activeTab = $scope.activeTabs[$scope.activeTabI];
    };

    var removeTab = function(i) {
      var removed = $scope.activeTabs[i];

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

    var addTab = function(obj) {
      var i = _.findIndex($scope.activeTabs, function(x) { return x.type === obj.type && x.id === obj.id;  });
      if (i === -1) {
        $scope.activeTabs.push(obj);
        i = $scope.activeTabs.length - 1;

        if (calendar !== undefined) {
          calendar.addTab(obj);
          initEvents();
        }
      }

      changeTab(i);
    };

    // Changing config
    var resetTeacherForm = function() {
      $scope.newElement = {allTerms: true};
    };

    var resetGroupForm = function() {
      $scope.newElement = {allTerms: true};
    };

    var resetRoomForm = function() {
      $scope.newElement = {allTerms: true};
    };

    var resetTermForm = function() {
      $scope.newElement = {addForAll: true, dayNames: Term.dayNames};
    };

    var datas = {
      teacher: {modal: '#add-config-teacher', cls: Teacher, reset: resetTeacherForm, apiServiceAddF: ApiService.addConfigTeacher, configAddF: 'addTeacher', configEditF: 'editTeacher'},
      group: {modal: '#add-config-group', cls: Group, reset: resetGroupForm, apiServiceAddF: ApiService.addConfigGroup, configAddF: 'addGroup', configEditF: 'editGroup'},
      room: {modal: '#add-config-room', cls: Room, reset: resetRoomForm, apiServiceAddF: ApiService.addConfigRoom, configAddF: 'addRoom', configEditF: 'editRoom'},
      term: {modal: '#add-config-term', cls: Term, reset: resetTermForm, apiServiceAddF: ApiService.addConfigTerm, configAddF: 'addTerm', configEditF: 'editTerm'}
    };

    var saveElement = function(type, form) {
      var data = datas[type];

      $(data.modal).modal('hide');
      var mode = $scope.modalModeEdit ? 'edit' : 'add';

      var tab = data.cls.initForModal($scope.config, $scope.newElement);

      data.apiServiceAddF(configId, tab, mode, $scope.newElement).success(function (result) {
        if (result.ok) {
          if (mode === 'add') {
            $scope.config[data.configAddF](tab, $scope.newElement);
          } else {
            $scope.config[data.configEditF](tab, $scope.newElement);
          }
          data.reset();
          addTab(tab);
          resetForm(form);
        }
      });

    };

    var openAddModal = function(type) {
      $scope.modalModeAdd = true;
      $scope.modalModeEdit = false;

      var modal = datas[type].modal;
      datas[type].reset();
      $(modal).modal('show');
    };

    var openEditModal = function() {
      $scope.modalModeAdd = false;
      $scope.modalModeEdit = true;

      var elem = $scope.activeTab;
      var data = datas[elem.type];

      $scope.newElement = elem.getForModal($scope.config);
      $(data.modal).modal('show');

    };

    var resetForm = function(form) {
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
    };

    var closeElementModal = function(type, form) {
      var data = datas[type];
      $(data.modal).modal('hide');
      data.reset();
      resetForm(form);
    };

    var areYouSureModal = function() {
      var tab = $scope.activeTab;
      $scope.areYouSureName = tab.getLongName();
      $scope.areYouSureCall = function() {
        return removeElement(tab);
      };
      $('#are-you-sure').modal('show');
    };
    var removeElement = function(elem) {
      $('#are-you-sure').modal('hide');
      ApiService.removeConfigElement(configId, elem).success(function(data) {
        if (data.ok) {
          $scope.config.removeElement(elem);
          var i = _.findIndex($scope.activeTabs, function(x) { return x.id === elem.id; });
          removeTab(i);
        }
      });
    };

    init();

    $scope.openAddModal = openAddModal;
    $scope.openEditModal = openEditModal;
    $scope.closeElementModal = closeElementModal;
    $scope.areYouSureModal = areYouSureModal;

    $scope.saveElement = saveElement;
    $scope.removeElement = removeElement;

    $scope.initCalendar = initCalendar;
    $scope.changeTab = changeTab;
    $scope.removeTab = removeTab;
    $scope.addTab = addTab;

  }
]);
