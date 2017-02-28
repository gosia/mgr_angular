'use strict';

angular.module('schedulerApp').controller('ObjectModificationController', [
  'ApiService', '$scope', 'Teacher', 'Group', 'Room', 'Term', '$routeParams',
  function (ApiService, $scope, Teacher, Group, Room, Term, $routeParams) {

    const configId = $routeParams.configId;

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
            $scope.$parent.reloadFile();
          }
          data.reset();
          $scope.board.addTab(tab);
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
        let i = _.findIndex($scope.activeTabs, x => x.id === elem.id);
        $scope.board.removeTab(i);

        if (elem.type === 'teacher' || elem.type === 'group') {
          $scope.$parent.reloadFile();
        }
      });
    };

    angular.extend($scope.board, {
      openAddModal: openAddModal,
      openEditModal: openEditModal,
      closeElementModal: closeElementModal,

      saveElement: saveElement,
      removeElement: removeElement,
    });

  }
]);
