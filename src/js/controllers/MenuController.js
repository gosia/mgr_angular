'use strict';
/*global angular */

angular.module('schedulerApp').controller('MenuController', ['$http', '$rootScope', '$scope', '$location',
  function ($http, $rootScope, $scope, $location) {

    var init = function () {
      setTimeout(function(){
        var $trees = $('.sidebar .treeview');
        if ($trees.length) { $trees.tree(); }
      }, 1000);
    };

    $scope.$on('$routeChangeSuccess', function() {
      $('#main-sidebar').find('li').removeClass('active');
      var elem = 'a[href="#'  + $location.path() + '"]';
      $($('#main-sidebar').find(elem)[0]).parent().addClass('active');
    });

    init();
  }
]);
