'use strict';
/*global angular */

angular.module('schedulerApp').factory('Term', [function() {
  function Term(id, start, end, day) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.day = day;
    this.type = 'term';
  }

  var dayNames = {
    0: 'pn',
    1: 'wt',
    2: 'sr',
    3: 'czw',
    4: 'pt',
    5: 'sb',
    6: 'nd'
  };

  function pad2(num) {
    return ('00' + num).substr(-2, 2);
  }

  Term.init = function(apiData) {
    return new Term(apiData.id, apiData.start, apiData.end, apiData.day);
  };

  Term.prototype.getPrettyName = function() {
    return dayNames[this.day] + ' ' + pad2(this.start.hour) + ':' + pad2(this.start.minute) + '-' +
      pad2(this.end.hour) + ':' + pad2(this.end.minute);
  };

  Term.prototype.getShortName = function() {
    return this.id;
  };

  Term.prototype.getLongName = function() {
    return 'Termin ' + this.id + ' (' + this.getPrettyName() + ')';
  };

  return Term;
}]);
