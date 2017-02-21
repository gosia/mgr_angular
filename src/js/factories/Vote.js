'use strict';

angular.module('schedulerApp').factory('Vote', ['Perms', function(Perms) {

  class Vote {
    constructor(configId, studentsNum, pointsNum, votes) {
      this.configId = configId;
      this.studentsNum = studentsNum;
      this.pointsNum = pointsNum;
      this.votes = votes;
      this.perms = Perms.init();
    }

    static init(apiData) {
      return new Vote(apiData.config_id, apiData.students_num, apiData.points_sum, apiData.votes);
    }
  }

  return Vote;
}]);
