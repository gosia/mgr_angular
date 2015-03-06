'use strict';
/*global angular */

angular.module('schedulerApp').controller('ContentController', ['$http', '$scope', '$timeout',
  function ($http, $scope, $timeout) {

    $scope.title = 'Strona główna';
    $scope.breadcrumbs = ['Strona główna'];

    var resetData = function(name, extra) {
      extra = extra || {};
      var mapping = {
        configs: {title: 'Przydziały', breadcrumbs: ['Strona główna', 'Przydziały']},
        config: {
          title: 'Przydział "' + extra.name + '"',
          breadcrumbs: ['Strona główna', 'Przydziały', 'Przydział "' + extra.name + '"']
        },
        main: {title: 'Strona główna', breadcrumbs: ['Strona główna']},
        tasks: {title: 'Zadania', breadcrumbs: ['Strona główna', 'Zadania']},
        task: {
          title: 'Zadanie "' + extra.name + '"',
          breadcrumbs: ['Strona główna', 'Zadania', 'Zadanie "' + extra.name + '"']
        }
      };

      $timeout(function() {
        $scope.title = mapping[name].title;
        $scope.breadcrumbs = mapping[name].breadcrumbs;
      }, 0);
    };

    $scope.$on('changeContent', function (event, name, extra) {
      resetData(name, extra);
    });

  }
]);
