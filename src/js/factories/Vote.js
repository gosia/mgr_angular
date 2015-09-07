'use strict';

angular.module('schedulerApp').factory('Vote', ['Perms', function(Perms) {
  function Vote(configId, votesNum, votes) {
    this.configId = configId;
    this.votesNum = votesNum;
    this.votes = votes;
    this.voteList = _.flatten(
      _.map(_.pairs(votes), function(pair) {
        return _.map(_.pairs(pair[1]), function(coursePair) {
          return {student: pair[0], course: coursePair[0], vote: coursePair[1]};
        });
      })
    );

    this.perms = Perms.init();
  }

  Vote.init = function(apiData) {
    return new Vote(apiData.config_id, apiData.votes_num, apiData.votes);
  };

  return Vote;
}]);
