'use strict';

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
  })
  .filter('termNotIn', function() {
    return function(terms, notInTerms) {
      var notInTermsMap = _.object(_.map(notInTerms, term => [term.id, term]));
      return _.filter(terms, term => notInTermsMap[term.id] === undefined);
    };
  });
