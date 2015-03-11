'use strict';
/*global angular, $, _ */

angular.module('schedulerApp').controller('BoardController', ['ApiService', '$routeParams', '$scope', 'Config', 'Calendar', 'Teacher', 'Group', 'Room',
  function (ApiService, $routeParams, $scope, Config, Calendar, Teacher, Group, Room) {
    var viewsList = [{value: 'tabs', label: 'Zakładki'}, {value: 'calendar', label: 'Kalendarz'}];
    $scope.viewsList = [viewsList[0]];

    $scope.activeTabs = [];
    $scope.activeTabI = -1;
    $scope.activeView = viewsList[0];
    $scope.editable = true;

    var calendar, configId, taskId;

    var init = function() {
      configId = $routeParams.configId;
      taskId = $routeParams.taskId;

      ApiService.getConfig(configId).success(function(data) {
        $scope.config = Config.init(data);
        $.AdminLTE.boxWidget.activate();
        $scope.activeTabs = [$scope.config.teachers[0], $scope.config.groups[0], $scope.config.rooms[0]];
        changeTab(0);

        if (taskId !== undefined) {
          ApiService.getTask(taskId).success(function(data) {
            $scope.config.setTimetable(data.timetable);

            if (!_.isEmpty(data.timetable.results)) {
              $scope.viewsList = viewsList;
            }
          });
        }

      });
    };

    // Calendar handling
    var initCalendar = function() {
      calendar = Calendar.init('#calendar', $scope.config);
      calendar.addTabs($scope.activeTabs);
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
        }
      }

      changeTab(i);
    };

    // Changing config
    var resetTeacherForm = function() {
      $scope.newTeacher = {allTerms: true};
    };

    var resetGroupForm = function() {
      $scope.newGroup = {allTerms: true};
    };

    var resetRoomForm = function() {
      $scope.newRoom = {allTerms: true};
    };

    var addX = function($selector, Obj, apiAddF, resetFormF, configAddF) {

      var resultF = function(apiData) {
        $selector.modal('hide');

        var tab = Obj.initForModal($scope.config, apiData);

        apiAddF(configId, tab).success(function (data) {
          if (data.ok) {
            $scope.config[configAddF](tab);
            resetFormF();
            addTab(tab);
          }
        });
      };

      return resultF;
    };

    var addTeacher = function() {
      var f = addX($('#add-config-teacher'), Teacher, ApiService.addConfigTeacher, resetTeacherForm, 'addTeacher');
      return f($scope.newTeacher);
    };
    var addGroup = function() {
      var f = addX($('#add-config-group'), Group, ApiService.addConfigGroup, resetGroupForm, 'addGroup');
      return f($scope.newGroup);
    };

    var addRoom = function() {
      var f = addX($('#add-config-room'), Room, ApiService.addConfigRoom, resetRoomForm, 'addRoom');
      return f($scope.newRoom);
    };

    init();

    resetTeacherForm();
    resetGroupForm();
    resetRoomForm();

    $scope.addTeacher = addTeacher;
    $scope.addGroup = addGroup;
    $scope.addRoom = addRoom;

    $scope.initCalendar = initCalendar;
    $scope.changeTab = changeTab;
    $scope.removeTab = removeTab;
    $scope.addTab = addTab;
  }
]);
