'use strict';
/* global angular, _ */

angular.module('schedulerApp').factory('CustomCalendar', [function () {

  function Calendar(id, config, addedCallback, deletedCallback) {
    this.id = id;
    this.$selector = $(id);
    this.config = config;
    this.addedCallback = addedCallback;
    this.deletedCallback = deletedCallback;

    this.events = [];
  }

  Calendar.prototype.removeTab = function(tab) {
    console.log('removeTab', tab);
    var events = _.map(tab.timetable, t => t.getEvent(this, tab));
    this.events = _.filter(this.events, t => !_.some(events, x => t.id === x.id));
  };

  Calendar.prototype.addTab = function(tab) {
    console.log('addTab', tab);
    var events = _.map(tab.timetable, t => t.getEvent(this, tab));
    this.events = _.uniq(this.events.concat(events), x => x.id);
  };

  Calendar.prototype.addTabs = function(tabs) {
    var calendar = this;
    _.each(tabs, tab => calendar.addTab(tab));
  };

  Calendar.prototype.reload = function(tabs) {
    var calendar = this;
    _.each(tabs, function(x) {
      calendar.removeTab(x);
      calendar.addTab(x);
    });
  };

  Calendar.init = function(id, config, addedCallback, deletedCallback) {
    return new Calendar(id, config, addedCallback, deletedCallback);
  };

  return Calendar;
}]);
