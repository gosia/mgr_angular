'use strict';
/*global angular, _ */

angular.module('schedulerApp').controller('TasksListController', ['ApiService', '$scope',
  function (ApiService, $scope) {
    var controller = this;

    controller.items = [];
    controller.numStart = 0;
    controller.numEnd = 0;
    controller.numAll = 0;
    controller.pages = 0;
    controller.activaPage = 0;

    var init = function(configId) {
      ApiService.getTasks().success(function(data) {
        controller.items = _.filter(data.results, function(x) {
          return configId === undefined || x.config_id === configId;
        });
        controller.numStart = data.num_start;
        controller.numEnd = data.num_end;
        controller.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1;
        controller.pages = _.range(1, Math.ceil(data.num_all / pageSize) + 1);
        controller.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    $scope.init = init;
  }
]);
