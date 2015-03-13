'use strict';
/*global angular, _ */

angular.module('schedulerApp').factory('ApiService', ['$http', function($http) {
  var urls = {
    getConfigs: '/api/configs.json',
    getConfig: '/api/config.json',
    createConfig: '/api/create_config.json',
    getTasks: '/api/tasks.json',
    getTask: '/api/task.json',
    createTask: '/api/create_task.json',
    addConfigTeacher: '/api/default.json',
    addConfigGroup: '/api/default.json',
    addConfigRoom: '/api/default.json',
    addConfigTerm: '/api/default.json',
    removeConfigElement: '/api/default.json'
  };
  var service = {urls: urls};

  service.getConfigs = function() {
    return $http.get(service.urls.getConfigs);
  };

  service.getConfig = function(configId) {
    return $http.get(service.urls.getConfig, {config_id: configId});
  };

  service.createConfig = function(id, year, term) {
    return $http.get(service.urls.createConfig, {id: id, year: year, term: term});
  };

  service.getTasks = function() {
    return $http.get(service.urls.getTasks);
  };

  service.getTask = function(taskId) {
    return $http.get(service.urls.getTask, {task_id: taskId});
  };

  service.createTask = function(configId, algorithm) {
    return $http.get(service.urls.createTask, {config_id: configId, algorithm: algorithm});
  };

  service.addConfigTeacher = function(configId, teacher) {
    return $http.get(
      service.urls.addConfigTeacher,
      {config_id: configId, teacher: {id: teacher.id, terms: _.map(teacher.terms, function(x) { return x.id; })}}
    );
  };

  service.addConfigGroup = function(configId, group) {
    return $http.get(
      service.urls.addConfigGroup,
      {
        config_id: configId,
        group: {
          id: group.id,
          terms: _.map(group.terms, function (x) { return x.id; }),
          terms_num: group.termsNum,
          students_num: group.studentsNum,
          teachers: _.map(group.teachers, function (x) { return x.id; }),
          same_term_group_ids: _.map(group.sameTermGroupIds, function (x) { return x.id; }),
          diff_term_group_ids: _.map(group.diffTermGroupIds, function (x) { return x.id; }),
          labels: _.map(group.labels, function (x) { return x.id; })
        }
      }
    );
  };

  service.addConfigRoom = function(configId, room) {
    return $http.get(
      service.urls.addConfigRoom,
      {
        config_id: configId,
        room: {
          id: room.id,
          terms: _.map(room.terms, function (x) { return x.id; }),
          capacity: room.capacity,
          labels: _.map(room.labels, function (x) { return x.id; })
        }
      }
    );
  };

  service.addConfigTerm = function(configId, term, apiData) {
    return $http.get(
      service.urls.addConfigTerm,
      {
        config_id: configId,
        term: {
          id: term.id,
          day: term.day,
          start: term.start,
          end: term.end
        },
        add_for_all: apiData.addForAll
      }
    );
  };

  service.removeConfigElement = function(configId, element) {
    return $http.get(
      service.urls.removeConfigElement,
      {
        config_id: configId,
        element_type: element.type,
        element_id: element.id
      }
    );
  };

  return service;
}]);
