'use strict';
/*global angular */

angular.module('schedulerApp').controller('ContentController', ['$http', '$scope', '$timeout',
  function ($http, $scope, $timeout) {

    var mapping = {
      '/default': '/static/templates/content/default.html',
      '/tasks': '/static/templates/content/tasks.html',
      '/configs': '/static/templates/content/configs.html'
    };

    var resetTemplate = function(url) {
      $timeout(function() {
        $scope.template = mapping[url];
      }, 0);
    };

    resetTemplate('/default');

    $scope.$on('changeContent', function (event, url) {
      console.log(url);
      resetTemplate(url);
    });
  }
]);
