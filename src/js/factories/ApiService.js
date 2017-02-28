'use strict';

angular.module('schedulerApp').factory('ApiService', [
  '$http', '$rootScope', '$q',
  function($http, $rootScope, $q) {

  let base = document.getElementsByTagName('base')[0].getAttribute('href');
  let urls = {
    getConfigs: () => base + 'api/configs/',
    getConfig: id => base + 'api/config/' + id + '/',
    removeConfig: id => base + 'api/config/' + id + '/',
    createConfig: () => base + 'api/config/',
    addConfigElement: id => base + 'api/config/' + id + '/add/',
    removeConfigElement: (id) => base + 'api/config/' + id + '/remove/',
    copyConfigElements: (id) => base + 'api/config/' + id + '/copy/',
    bulkEditConfigElements: id => base + 'api/config/' + id + '/bulk-edit/',

    getTasks: () => base + 'api/tasks/',
    getTask: id => base + 'api/task/' + id + '/',
    removeTask: id => base + 'api/task/' + id + '/',
    startTask: id => base + 'api/task/' + id + '/start/',
    taskRating: id => base + 'api/task/' + id + '/rating/',
    createTask: () => base + 'api/task/',
    addTaskElement: id => base + 'api/task/' + id + '/add/',
    getBusyTerms: (id, groupId) => base + 'api/task/' + id + '/busy_terms/' + groupId + '/',
    removeTaskElement: id => base + 'api/task/' + id + '/remove/',

    removeFile: id => base + 'api/file/' + id + '/',
    createFile: () => base + 'api/file/',
    getFiles: () => base + 'api/files/',
    getFile: id => base + 'api/file/' + id + '/',
    saveFile: id => base + 'api/file/' + id + '/save/',
    linkFile: id => base + 'api/file/' + id + '/link/',

    getRatings: () => base + 'api/ratings/',
    getRating: id => base + 'api/rating/' + id + '/',
    removeRating: id => base + 'api/rating/' + id + '/',
    saveRating: id => base + 'api/rating/' + id + '/save/',

    getVotes: () => base + 'api/votes/',
    getVote: id => base + 'api/vote/' + id + '/',
    removeVote: id => base + 'api/vote/' + id + '/',
    createVote: () => base + 'api/vote/'
  };
  let service = {urls: urls};

  let showAlert = function() {
    $rootScope.$broadcast('addAlertByCode', '500');
  };
  let checkErrorResponse = function(data){
    if (data.ok === false) {
      if (data.message) {
        $rootScope.$broadcast('addAlertByMessage', data.message);
      } else {
        $rootScope.$broadcast('addAlertByCode', '500');
      }
    }
  };

  let httpToQ = function(httpPromise) {
    let deferred = $q.defer();

    httpPromise
      .then(
        function(response) {
          let data = response.data;
          checkErrorResponse(data);
          if (data.ok === false) {
            deferred.reject();
          } else {
            deferred.resolve(data);
          }
        },
        function() {
          showAlert();
          deferred.reject();
        }
      );

    return deferred.promise;
  };

  service.getConfigs = function() {
    return httpToQ($http.get(service.urls.getConfigs()));
  };

  service.getConfig = function(configId) {
    return httpToQ($http.get(service.urls.getConfig(configId)));
  };

  service.createConfig = function(configId, year, term) {
    return httpToQ(
      $http
      .post(service.urls.createConfig(), {config_id: configId, year: year, term: parseInt(term)})
    );
  };

  service.removeConfig = function(configId) {
    return httpToQ(
      $http.delete(service.urls.removeConfig(configId))
    );
  };

  service.getTasks = function() {
    return httpToQ($http.get(service.urls.getTasks()));
  };

  service.getTask = function(taskId) {
    return httpToQ($http.get(service.urls.getTask(taskId)));
  };

  service.removeTask = function(taskId) {
    return httpToQ($http.delete(service.urls.removeTask(taskId)));
  };

  service.getTaskRating = function(taskId) {
    return httpToQ($http.get(service.urls.taskRating(taskId)));
  };

  service.startTask = function(taskId) {
    return httpToQ($http.post(service.urls.startTask(taskId), {}));
  };

  service.createTask = function(configId, algorithm) {
    return httpToQ(
      $http.post(service.urls.createTask(), {config_id: configId, algorithm: algorithm})
    );
  };

  service.addConfigTeacher = function(configId, teacher, mode) {
    return httpToQ(
      $http.post(
        service.urls.addConfigElement(configId),
        {
          config_id: configId,
          mode: mode,
          type: 'teacher',
          teacher: {
            id: teacher.id,
            terms: _.map(teacher.terms, x => x.id),
            first_name: teacher.extra.firstName,
            last_name: teacher.extra.lastName,
            notes: teacher.extra.notes || '',
            pensum: teacher.extra.pensum
          }
        }
      )
    );
  };

  service.addConfigGroup = function(configId, group, mode) {
    return httpToQ(
      $http.post(
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
            room_labels: group.room_labels,
            course: group.extra.course,
            group_type: group.extra.groupType,
            notes: group.extra.notes || ''
          }
        }
      )
    );
  };

    service.modifyConfigGroups = function(configId, groupIds, value) {
      return httpToQ(
        $http.post(
          service.urls.bulkEditConfigElements(configId),
          {
            config_id: configId,
            type: 'group',
            group_ids: groupIds,
            value: value
          }
        )
      );
    };

  service.addConfigRoom = function(configId, room, mode) {
    return httpToQ(
      $http.post(
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
      )
    );
  };

  service.addConfigTerm = function(configId, term, mode, apiData) {
    return httpToQ(
      $http.post(
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
      )
    );
  };

  service.removeConfigElement = function(configId, element) {
    return httpToQ(
      $http.post(
        service.urls.removeConfigElement(configId),
        {
          config_id: configId,
          element_type: element.type,
          element_id: element.id
        }
      )
    );
  };

  service.addEvent = function(taskId, groupId, day, hour, minute) {
    return httpToQ(
      $http.post(
        service.urls.addTaskElement(taskId),
        {
          group_id: groupId,
          day: day,
          hour: hour,
          minute: minute
        }
      )
    );
  };

  service.removeEvent = function(taskId, timetableObj) {
    return httpToQ(
      $http.post(
        service.urls.removeTaskElement(taskId), {
          group_id: timetableObj.group.id
        }
      )
    );
  };

  service.copyConfigElements = function(type, toConfigId, fromConfigId) {
    return httpToQ(
      $http.post(
        service.urls.copyConfigElements(toConfigId), {
          type: type,
          from: fromConfigId
        }
      )
    );
  };

  service.getBusyTermsForGroup = function(taskId, groupId) {
    return httpToQ($http.get(service.urls.getBusyTerms(taskId, groupId)));
  };

  service.getFiles = function() {
    return httpToQ($http.get(service.urls.getFiles()));
  };

  service.getFile = function(fileId) {
    return httpToQ($http.get(service.urls.getFile(fileId)));
  };

  service.createFile = function(fileId, year) {
    return httpToQ($http.post(service.urls.createFile(), {file_id: fileId, year: year}));
  };

  service.removeFile = function(fileId) {
    return httpToQ($http.delete(service.urls.removeFile(fileId)));
  };

  service.saveFile = function(fileId, content) {
    return httpToQ($http.post(service.urls.saveFile(fileId), content));
  };

  service.linkFile = function(fileId) {
    return httpToQ($http.post(service.urls.linkFile(fileId), {}));
  };

  service.getVotes = function() {
    return httpToQ($http.get(service.urls.getVotes()));
  };

  service.getVote = function(configId) {
    return httpToQ($http.get(service.urls.getVote(configId)));
  };

  service.removeVote = function(configId) {
    return httpToQ($http.delete(service.urls.removeVote(configId)));
  };

  service.createVote = function(configId, content) {
    return httpToQ(
      $http.post(service.urls.createVote(), {config_id: configId, content: content})
    );
  };

  service.getRatings = function() {
    return httpToQ($http.get(service.urls.getRatings()));
  };

  service.getRating = function(ratingId) {
    return httpToQ($http.get(service.urls.getRating(ratingId)));
  };

  service.removeRating = function(ratingId) {
    return httpToQ($http.delete(service.urls.removeRating(ratingId)));
  };

  service.saveRating = function(rating) {
    return httpToQ($http.post(service.urls.saveRating(rating.id), rating));
  };

  return service;
}]);
