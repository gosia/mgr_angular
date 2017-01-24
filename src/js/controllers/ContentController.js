'use strict';

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
        },
        files: {title: 'Plany', breadcrumbs: ['Strona główna', 'Plany']},
        file: {
          title: 'Plan "' + extra.name + '"',
          breadcrumbs: ['Strona główna', 'Plany', 'Plan "' + extra.name + '"']
        },
        votes: {title: 'Głosowania', breadcrumbs: ['Strona główna', 'Głosowania']},
        vote: {
          title: 'Głosowanie "' + extra.name + '"',
          breadcrumbs: ['Strona główna', 'Głosowanie', 'Głosowanie "' + extra.name + '"']
        },
        ratings: {title: 'Schematy oceny', breadcrumbs: ['Strona główna', 'Schematy oceny']},
        rating: {
          title: 'Schemat "' + extra.name + '"',
          breadcrumbs: ['Strona główna', 'Schematy oceny', 'Schemat "' + extra.name + '"']
        },
      };

      $timeout(function() {
        $scope.title = mapping[name].title;
        $scope.breadcrumbs = mapping[name].breadcrumbs;
      }, 0);
    };

    $scope.$on('changeContent', function (event, name, extra) {
      resetData(name, extra);
    });

    $scope.base = document.getElementsByTagName('base')[0].getAttribute('href');

  }
]);
