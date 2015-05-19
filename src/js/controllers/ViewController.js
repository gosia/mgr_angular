'use strict';

angular.module('schedulerApp').controller('ViewController', ['$scope', function ($scope) {
  var COMPRESSED = 'compressed', EXPANDED = 'expanded';

  var state = EXPANDED;

  function toggleIsOpen() {
    if ($(window).width() > 767) {
      console.log(!$('body').hasClass('sidebar-collapse'), $('body').hasClass('sidebar-collapse'));
      return !$('body').hasClass('sidebar-collapse');
    }
    else {
      return $('body').hasClass('sidebar-open');
    }
  }

  var changeState = function() {
    var newState = state === EXPANDED ? COMPRESSED : EXPANDED;

    if (newState === EXPANDED) {
      $('.view-compress').removeClass('hidden');
      $('#view-change-button').removeClass('fa-compress').addClass('fa-expand');
      if (!toggleIsOpen()) {
        $('[data-toggle="offcanvas"]').click();
      }
      $('.content').removeClass('view-compressed');
    } else {
      $('.view-compress').addClass('hidden');
      $('#view-change-button').removeClass('fa-expand').addClass('fa-compress');
      if (toggleIsOpen()) {
        $('[data-toggle="offcanvas"]').click();
      }
      $('.content').addClass('view-compressed');
    }

    state = newState;
  };

  $scope.changeState = changeState;
}
]);
