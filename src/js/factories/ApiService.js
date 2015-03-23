'use strict';
/* global angular, _, document */

angular.module('schedulerApp').factory('ApiService', ['$http', function($http) {
  var base = document.getElementsByTagName('base')[0].getAttribute('href');
  var urls = {
    getConfigs: () => base + 'api/configs/',
    getConfig: id => base + 'api/config/' + id + '/',
    createConfig: () => base + 'api/config/',
    addConfigElement: id => base + 'api/config/' + id + '/add/',
    removeConfigElement: (id) => base + 'api/config/' + id + '/remove/',

    getTasks: () => base + 'api/tasks/',
    getTask: id => base + 'api/task/' + id + '/',
    createTask: () => base + 'api/task/',
    addTaskElement: id => base + 'api/task/' + id + '/add/',
    removeTaskElement: id => base + 'api/task/' + id + '/remove/'
  };
  var service = {urls: urls};

  service.getConfigs = function() {
    return $http.get(service.urls.getConfigs());
  };

  service.getConfig = function(configId) {
    return $http.get(service.urls.getConfig(configId));
  };

  service.createConfig = function(configId, year, term) {
    return $http.post(service.urls.createConfig(), {config_id: configId, year: year, term: term});
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
          terms: _.map(teacher.terms, x => x.id)
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
          terms: _.map(group.terms, x => x.id),
          terms_num: group.termsNum,
          students_num: group.studentsNum,
          teachers: _.map(group.teachers, x => x.id),
          same_term_group_ids: _.map(group.sameTermGroupIds, x => x.id),
          diff_term_group_ids: _.map(group.diffTermGroupIds, x => x.id),
          labels: group.labels,
          course: group.extra.course,
          group_type: group.extra.groupType
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
          terms: _.map(room.terms, x => x.id),
          capacity: room.capacity,
          labels: room.labels
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
