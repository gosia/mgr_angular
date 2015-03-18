'use strict';
/* global angular, _, document */

angular.module('schedulerApp').factory('ApiService', ['$http', function($http) {
  var base = document.getElementsByTagName('base')[0].getAttribute('href');
  var urls = {
    getConfigs: function() { return base + 'api/configs'; },
    getConfig: function(id) { return base + 'api/config/' + id; },
    createConfig: function() { return base + 'api/config'; },
    addConfigElement: function(id) { return base + 'api/config/' + id + '/add'; },
    removeConfigElement: function(id) { return base + 'api/config/' + id + '/remove'; },

    getTasks: function() { return base + 'api/tasks'; },
    getTask: function(id) { return base + 'api/task/' + id; },
    createTask: function() { return base + 'api/task'; },
    addTaskElement: function(id) { return base + 'api/task/' + id + '/add'; },
    removeTaskElement: function(id) { return base + 'api/task/' + id + '/remove'; }
  };
  var service = {urls: urls};

  service.getConfigs = function() {
    return $http.get(service.urls.getConfigs());
  };

  service.getConfig = function(configId) {
    return $http.get(service.urls.getConfig(configId));
  };

  service.createConfig = function(id, year, term) {
    return $http.post(service.urls.createConfig(), {id: id, year: year, term: term});
  };

  service.getTasks = function() {
    return $http.get(service.urls.getTasks());
  };

  service.getTask = function(taskId) {
    return $http.get(service.urls.getTask(taskId));
  };

  service.createTask = function(configId, algorithm) {
    return $http.post(service.urls.createTask(), {config_id: configId, algorithm: algorithm});
  };

  service.addConfigTeacher = function(configId, teacher, mode) {
    return $http.post(
      service.urls.addConfigElement(configId),
      {
        config_id: configId,
        mode: mode,
        type: 'teacher',
        teacher: {
          id: teacher.id,
          mode: mode,
          terms: _.map(teacher.terms, function(x) { return x.id; })
        }
      }
    );
  };

  service.addConfigGroup = function(configId, group, mode) {
    return $http.post(
      service.urls.addConfigElement(configId),
      {
        config_id: configId,
        mode: mode,
        type: 'group',
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

  service.addConfigRoom = function(configId, room, mode) {
    return $http.post(
      service.urls.addConfigElement(configId),
      {
        config_id: configId,
        mode: mode,
        type: 'room',
        room: {
          id: room.id,
          terms: _.map(room.terms, function (x) { return x.id; }),
          capacity: room.capacity,
          labels: _.map(room.labels, function (x) { return x.id; })
        }
      }
    );
  };

  service.addConfigTerm = function(configId, term, mode, apiData) {
    return $http.post(
      service.urls.addConfigElement(configId),
      {
        config_id: configId,
        mode: mode,
        type: 'term',
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
    return $http.post(
      service.urls.removeConfigElement(configId),
      {
        config_id: configId,
        element_type: element.type,
        element_id: element.id
      }
    );
  };

  service.addEvent = function(taskId, groupId, day, hour, minute) {
    return $http.post(
      service.urls.addTaskElement(taskId),
      {
        group_id: groupId,
        day: day,
        hour: hour,
        minute: minute
      }
    );
  };

  service.removeEvent = function(taskId, timetableObj) {
    return $http.post(
      service.urls.removeTaskElement(taskId), {
        group_id: timetableObj.group.id,
        term_id: timetableObj.term.id,
        room_id: timetableObj.room.id
      }
    );
  };

  return service;
}]);
