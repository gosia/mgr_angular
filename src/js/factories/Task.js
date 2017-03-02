'use strict';

angular.module('schedulerApp').factory('Task', [
  'Perms', 'TimeTableObj',
  function(Perms, TimeTableObj) {
    function Task(id, configId, algorithm, status, timetable) {
      this.id = id;
      this.configId = configId;
      this.algorithm = algorithm;
      this.status = status;
      this.raw_timetable = timetable;

      this.perms = Perms.init();
    }

    Task.init = function(apiData) {
      let timetable = apiData.timetable ?  apiData.timetable.results : [];
      return new Task(
        apiData.id, apiData.config_id, apiData.algorithm, apiData.status, timetable
      );
    };

    Task.prototype.setConfig = function (config) {
      this.config = config;

      this.timetable = _.flatten(
        _.map(this.raw_timetable, (vv, k) => {
          return _.map(vv, (v) => {
            return new TimeTableObj(
              config.groupsMap[k],
              config.termsMap[v.term],
              config.roomsMap[v.room]
            );
          });
        }),
        true
      );

      this.timetableByTerms = _.groupBy(this.timetable, x => x.term.id);
    };

    return Task;
  }
]);
