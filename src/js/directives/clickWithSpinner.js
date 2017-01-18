'use strict';

angular.module('schedulerApp')
  .directive('clickWithSpinner', [function() {
    var linker = function($scope, $element, $attr) {

      var spinnerHtml = angular.element(
        '<span class="glyphicon glyphicon-refresh" style="margin-left: 5px"></span>'
      );

      var addSpinner = function() {
        $element.append(spinnerHtml);
        $scope.spinnerIsActivated = true;
      };

      var removeSpinner = function() {
        $element.find('span.glyphicon').remove();
        $scope.spinnerIsActivated = false;
      };

      var setWidth = function() {
        // we need to set min width to avoid button being shrink with spinner
        // (in case button has no fixed size)
        $element.css('min-width', $element.outerWidth());
      };

      var executeAction = function() {

        addSpinner();
        $scope.$apply(function (){
          var promise = $scope.clickWithSpinner();
          if (promise) {
            promise.then(function () {
              removeSpinner();
            }, function () {
              removeSpinner();
            });
          }
        });
      };

      $element.click(function($event) {
        $event.preventDefault();
        setWidth();
        executeAction();
      });

      if ($attr.enterWithSpinner) {
        $('body').on('keypress', $attr.enterWithSpinner, function(event) {
          if (event.which === 13) {
            // execute action on enter key press
            event.preventDefault();
            executeAction();
          }
        });
      }

      $scope.spinnerIsActivated = false;

    };

    return {
      restrict: 'A',
      transclude: true,
      template: '<span ng-hide="spinnerIsActivated"><ng-transclude></ng-transclude></span>',
      scope: {
        clickWithSpinner: '&'
      },
      link: linker
    };
  }]);
