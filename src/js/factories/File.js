'use strict';

angular.module('schedulerApp').factory('File', ['Perms', '$q', function(Perms, $q) {
  function File(id, year, linked, content) {
    this.id = id;
    this.year = year;
    this.linked = linked;
    this.errors = [];
    this.linesNum = 0;
    this.hasErrors = false;
    this.setContent(content);

    this.perms = Perms.init();
  }


  File.init = function(apiData) {
    return new File(apiData.id, apiData.year, apiData.linked, apiData.content);
  };

  File.initForList = function(apiData) {
    return new File(apiData.id, apiData.year, apiData.linked, undefined);
  };

  File.prototype.setContent = function(content) {
    var file = this;
    return $q(function(resolve) {
      file.content = content;
      if (content !== undefined) {
        file.linesNum = content.split('\n').length;
        file.validate().then(function () {
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  var error = function(message, line) {
    return {type: 'err', message: message, line: line + 1};
  };
  var warning = function(message, line) {
    return {type: 'war', message: message, line: line + 1};
  };

  var validateTeacherLine = function(line, lineNum, teacherMap) {
    if (line.length !== 7) {
      return error('Linia zawiera ' + line.length + ' elementów zamiast 7', lineNum);
    }

    var id = line[1];
    var pensum = parseInt(line[5]);

    if (teacherMap[id] !== undefined) {
      return error('Zduplikowany prowadzący (patrz linia ' + teacherMap[id].line + ')', lineNum);
    }
    if (isNaN(pensum)) {
      return error('Pensum musi być liczbą', lineNum);
    }

    teacherMap[id] = {line: lineNum, pensum: pensum, groups: []};
  };

  var validateGroupLine = function(line, lineNum, teacherMap, groupMap) {
    if (line.length !== 7) {
      return error('Linia zawiera ' + line.length + ' elementów zamiast 7', lineNum);
    }

    var course = line[2];
    var group = line[3];
    var hours = parseInt(line[4]);
    var teacher = line[5];

    if (teacherMap[teacher] === undefined) {
      return error('Nieznany prowadzący "' + teacher + '"', lineNum);
    }
    if (isNaN(hours)) {
      return error('Godziny muszą być liczbą', lineNum);
    }

    if (groupMap[course] === undefined) {
      groupMap[course] = {};
    }
    if (groupMap[course][group] === undefined) {
      groupMap[course][group] = [];
    }
    var data = {teacher: teacher, hours: hours};
    groupMap[course][group].push(data);
    teacherMap[teacher].groups.push(data);
  };

  var validateAll = function(teacherMap) {
    var result = [];
    _.each(teacherMap, (value, key) => {
      var hours = _.reduce(_.map(value.groups, x => x.hours), (memo, num) => memo + num, 0);
      if (hours * 15 !== value.pensum) {
        result.push(warning('Pensum dla "' + key + '" się nie zgadza: jest ' + hours * 15 + ' godzin zamiast ' + value.pensum, value.line));
      }
    });
    return result;
  };

  File.prototype.validate = function() {
    var file = this;

    return $q(function(resolve) {
      var validationMessages = [];
      var lines = file.content.split('\n').map(x => x.split('|'));
      var teacherMap = {}, err, groupMap = {};

      // handle teachers
      _.each(lines, (line, lineNum) => {
        if (line.length === 0) {
          return;
        }
        if (line[0] === 'o') {
          err = validateTeacherLine(line, lineNum, teacherMap);
          if (err !== undefined) {
            validationMessages.push(err);
          }
        }
      });

      // handle groups
      _.each(lines, (line, lineNum) => {
        if (line.length === 0) {
          return;
        }
        if (line[0] === '1' || line[0] === '2') {
          err = validateGroupLine(line, lineNum, teacherMap, groupMap);
          if (err !== undefined) {
            validationMessages.push(err);
          }
        }
      });

      // handle summary
      err = validateAll(teacherMap);
      if (err !== undefined) {
        validationMessages = validationMessages.concat(err);
      }

      file.errors = validationMessages;
      file.hasErrors = _.some(validationMessages, message => message.type === 'err');
      resolve();
    });
  };

  return File;
}]);
