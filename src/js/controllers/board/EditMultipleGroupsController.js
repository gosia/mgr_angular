'use strict';

angular.module('schedulerApp').controller('EditMultipleGroupsController', [
  'ApiService', '$scope', 'Group', function (ApiService, $scope, Group) {

    let activate = function() {
      $scope.bulkEdit.isActive = true;
      $scope.bulkEdit.selected = {};
    };
    let deactivate = function() {
      $scope.bulkEdit.isActive = false;
    };
    let selectAllGroups = function() {
      if ($scope.bulkEdit.selectedAll) {
        $scope.bulkEdit.selectedList = [];
        _.chain($scope.config.groups)
          .filter($scope.board.filterGroup)
          .each(group => {
            $scope.bulkEdit.selected[group.id] = true;
            $scope.bulkEdit.selectedList.push(group);
          });
      } else {
        $scope.bulkEdit.selected = {};
        $scope.bulkEdit.selectedList = [];
      }
    };
    let selectOne = function(group) {
      if ($scope.bulkEdit.selected[group.id]) {
        $scope.bulkEdit.selectedList.push(group);
      } else {
        let index = $scope.bulkEdit.selectedList.indexOf(group);
        if (index > -1) {
          $scope.bulkEdit.selectedList.splice(index, 1);
        }
      }
    };
    let openModal = function() {
      $('#edit-multiple-groups-modal').modal('show');
      $scope.bulkEdit.group = {};
    };
    let sections = [
      {label: 'Terminy', key: 'terms'},
      {label: 'Liczba godzin', key: 'termsNum'},
      {label: 'Liczba studentów', key: 'studentsNum'},
      {label: 'Przedmiot', key: 'course'},
      {label: 'Typ zajęć', key: 'groupType'},
      {label: 'Nauczyciele', key: 'teachers'},
      {label: 'Etykiety sal', key: 'labels'},
      {label: 'Notatka', key: 'notes'}
    ];
    let editNewSection = function(section) {
      $scope.bulkEdit.group[section] = '';
      if (section === 'terms') {
        $scope.bulkEdit.group.allTerms = true;
      }
    };
    let removeSection = function(section) {
      $scope.bulkEdit.group[section] = undefined;
    };

    let resetForm = function(form) {
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
    };

    let save = function(form) {
      $('#edit-multiple-groups-modal').modal('hide');

      let data = $scope.bulkEdit.group;
      let config = $scope.config;

      let termIds = data.allTerms ? _.map(config.terms, x => x.id) : (data.terms ?
        _.filter(data.terms.split(','), x => config.termsMap[x] !== undefined) :
        undefined);

      let teacherIds = data.teachers !== undefined ?
        _.filter(data.teachers.split(','), x => config.teachersMap[x] !== undefined) :
        undefined;

      let labels = data.room_labels ?
        _.map(data.room_labels.split(';'), x => x.split(',')) :
        undefined;

      let value = {
        terms: termIds,
        terms_num: data.termsNum,
        students_num: data.studentsNum,
        teachers: teacherIds,
        course: data.course,
        group_type: data.groupType,
        room_labels: labels,
        notes: data.notes
      };

      let groupIds = _.map($scope.bulkEdit.selectedList, x => x.id);

      return ApiService.modifyConfigGroups(
        $scope.config.id,
        groupIds,
        value
      ).success(() => {
        _.each(groupIds, groupId => {
          let group = Group.initFromMultipleModal($scope.config, value, groupId);
          $scope.config.editGroup(group);
        });
        $scope.bulkEdit.group = {};
        resetForm(form);
        $scope.reloadFile();
      });
    };

    $scope.bulkEdit = {
      openModal: openModal,

      activate: activate,
      deactivate: deactivate,
      selectAll: selectAllGroups,
      selectOne: selectOne,
      editNewSection: editNewSection,
      removeSection: removeSection,
      save: save,
      selected: {},
      selectedList: [],
      isActive: false,
      selectedAll: false,

      sections: sections,
      group: {}
    };

  }
]);
