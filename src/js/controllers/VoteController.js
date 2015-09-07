'use strict';

angular.module('schedulerApp').controller('VoteController', [
  'ApiService', '$routeParams', '$rootScope', '$scope', '$location', 'Vote',
  function (ApiService, $routeParams, $rootScope, $scope, $location, Vote) {
    $rootScope.$broadcast('changeContent', 'vote', {name: $routeParams.configId});

    var init = function() {
      ApiService.getVote($routeParams.configId).success(function(data) {
        $scope.vote = Vote.init(data);
      });

      if ($location.hash() !== '') {
        $('.nav-tabs a[href="#' + $location.hash() + '"]').tab('show');
      }
    };

    var removeVote = function() {
      ApiService.removeVote($scope.vote.configId).success(function() {
        $location.url('/votes');
      });
    };

    init();

    $scope.removeVote = removeVote;
  }
]);
