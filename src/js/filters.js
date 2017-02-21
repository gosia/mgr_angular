'use strict';

/* global moment */

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
  })
  .filter('toHM', function() {
    return function(minutes) {
      return moment().startOf('day')
        .minutes(minutes)
        .format('H:mm');
    };
  })
  .filter('toD', function() {
    return function(day) {
      var m = {
        0: 'pn',
        1: 'wt',
        2: 'śr',
        3: 'cz',
        4: 'pt',
        5: 'sb',
        6: 'nd'
      };

      return m[day];
    };
  })
  .filter('toStudentNum', function() {
    return function(xs) {
      if (xs === undefined) { return 0; }
      return _.chain(xs).map(x => x.student).uniq().size();
    };
  })
  .filter('toCourseNum', function() {
    return function(xs) {
      if (xs === undefined) { return 0; }
      return _.chain(xs).map(x => x.course).uniq().size();
    };
  })
  .filter('toPointsSum', function() {
    return function(xs) {
      if (xs === undefined) { return 0; }
      return _.chain(xs).map(x => x.points).reduce((a, b) => a + b, 0);
    };
  })
  .filter('toTrustedHtml', ['$sce', function ($sce) {
    return function (text) {
      return $sce.trustAsHtml(text);
    };
  }]);
