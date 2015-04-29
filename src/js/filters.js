'use strict';
/* global angular, _ */

angular.module('schedulerApp')
  .filter('getEvents', function() {
    return function(activeTabs) {
      var events = _.uniq(
        _.flatten(
          _.map(activeTabs, function(x) { return x.newEvents(); }),
          true
        ),
        function(x) { return x.id; }
      );

      return events;
    };
  });
