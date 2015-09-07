'use strict';

angular.module('schedulerApp').controller('VotesController', [
  'ApiService', '$scope', '$location', 'Vote', 'User', '$rootScope',
  function (ApiService, $scope, $location, Vote, User, $rootScope) {
    $rootScope.$broadcast('changeContent', 'votes');

    $scope.numStart = 0;
    $scope.numEnd = 0;
    $scope.numAll = 0;
    $scope.pages = 0;
    $scope.activaPage = 0;

    $scope.newVote = {configId: undefined, content: undefined};

    $scope.user = User.init();

    var init = function(configId) {
      $scope.newVote.configId = configId;
      ApiService.getVotes().success(function(data) {
        $scope.items = _.map(
          _.filter(data.results, function(x) {
            return configId === undefined || x.config_id === configId;
          }),
            x => Vote.init(x)
        );
        $scope.numStart = data.num_start;
        $scope.numEnd = data.num_end;
        $scope.numAll = data.num_all;

        var pageSize = data.num_end - data.num_start + 1, pageNum;
        if (pageSize === 0) {
          pageNum = 1;
        } else {
          pageNum = Math.ceil(data.num_all / pageSize) + 1;
        }
        $scope.pages = _.range(1, pageNum);
        $scope.activePage = Math.floor(data.num_start / pageSize) + 1;
      });
    };

    var createVote = function() {
      ApiService
        .createVote($scope.newVote.configId, $scope.newVote.content)
        .success(function() {
          var url = '/vote/' + $scope.newVote.configId;
          $location.path(url).hash('basic');
        })
        .error(function() {
          $('#create-vote-modal').modal('hide');
        });
    };

    var removeVote = function(configId) {
      ApiService.removeVote(configId).success(function() {
        $scope.items = _.filter($scope.items, x => x.configId !== configId);
      });
    };

    $scope.init = init;
    $scope.createVote = createVote;
    $scope.removeVote = removeVote;
    $scope.newVoteContentPlaceholder = '221030|Kurs C|2\n221030|Kurs Ruby|3';
  }
]);
