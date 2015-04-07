'use strict';
/* global angular, _, document */

angular.module('schedulerApp').factory('ApiService', ['$http', '$rootScope', function($http, $rootScope) {
  var base = document.getElementsByTagName('base')[0].getAttribute('href');
  var urls = {
    getConfigs: () => base + 'api/configs/',
    getConfig: id => base + 'api/config/' + id + '/',
    createConfig: () => base + 'api/config/',
    addConfigElement: id => base + 'api/config/' + id + '/add/',
    removeConfigElement: (id) => base + 'api/config/' + id + '/remove/',
    copyConfigElements: (id) => base + 'api/config/' + id + '/copy/',

    getTasks: () => base + 'api/tasks/',
    getTask: id => base + 'api/task/' + id + '/',
    removeTask: id => base + 'api/task/' + id + '/',
    startTask: id => base + 'api/task/' + id + '/start/',
    createTask: () => base + 'api/task/',
    addTaskElement: id => base + 'api/task/' + id + '/add/',
    removeTaskElement: id => base + 'api/task/' + id + '/remove/'
  };
  var service = {urls: urls};

  var showAlert = function() {
    $rootScope.$broadcast('addAlertByCode', '500');
  };
  var checkErrorResponse = function(data){
    if (data.ok === false) {
      $rootScope.$broadcast('addAlertByMessage', data.message);
    }
  };

  service.getConfigs = function() {
    return $http.get(service.urls.getConfigs()).error(showAlert).success(checkErrorResponse);
  };

  service.getConfig = function(configId) {
    return $http.get(service.urls.getConfig(configId)).error(showAlert).success(checkErrorResponse);
  };

  service.createConfig = function(configId, year, term) {
    return $http
      .post(service.urls.createConfig(), {config_id: configId, year: year, term: term})
      .error(showAlert)
      .success(checkErrorResponse);
  };

  service.getTasks = function() {
    return $http.get(service.urls.getTasks()).error(showAlert).success(checkErrorResponse);
  };

  service.getTask = function(taskId) {
    return $http.get(service.urls.getTask(taskId)).error(showAlert).success(checkErrorResponse);
  };

  service.removeTask = function(taskId) {
    return $http
      .delete(service.urls.removeTask(taskId))
      .error(showAlert)
      .success(checkErrorResponse);
  };

  service.startTask = function(taskId) {
    return $http
      .post(service.urls.startTask(taskId))
      .error(showAlert)
      .success(checkErrorResponse);
  };

  service.createTask = function(configId, algorithm) {
    return $http
      .post(service.urls.createTask(), {config_id: configId, algorithm: algorithm})
      .error(showAlert)
      .success(checkErrorResponse);
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
    ).error(showAlert).success(checkErrorResponse);
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
    ).error(showAlert).success(checkErrorResponse);
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
    ).error(showAlert).success(checkErrorResponse);
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
    ).error(showAlert).success(checkErrorResponse);
  };

  service.removeConfigElement = function(configId, element) {
    return $http.post(
      service.urls.removeConfigElement(configId),
      {
        config_id: configId,
        element_type: element.type,
        element_id: element.id
      }
    ).error(showAlert);
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
    ).error(showAlert).success(checkErrorResponse);
  };

  service.removeEvent = function(taskId, timetableObj) {
    return $http.post(
      service.urls.removeTaskElement(taskId), {
        group_id: timetableObj.group.id
      }
    ).error(showAlert).success(checkErrorResponse);
  };

  service.copyConfigElements = function(type, toConfigId, fromConfigId) {
    return $http.post(
      service.urls.copyConfigElements(toConfigId), {
        type: type,
        from: fromConfigId
      }
    ).error(showAlert).success(checkErrorResponse);
  };

  return service;
}]);
