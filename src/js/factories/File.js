'use strict';

angular.module('schedulerApp').factory('File', ['Perms', '$q', function(Perms, $q) {
  function File(id, year, linked, content, configs) {
    this.id = id;
    this.year = year;
    this.linked = linked;
    this.configs = configs || [];
    this.errors = [];
    this.linesNum = 0;
    this.hasErrors = false;
    this.setContent(content);

    this.perms = Perms.init();
  }


  File.init = function(apiData) {
    return new File(apiData.id, apiData.year, apiData.linked, apiData.content, apiData.configs);
  };

  File.initForList = function(apiData) {
    return new File(apiData.id, apiData.year, apiData.linked, undefined, apiData.configs);
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

    let id = line[1];
    let firstName = line[2];
    let lastName = line[4];
    let pensum = parseInt(line[5]);

    if (teacherMap[id] !== undefined) {
      return error('Zduplikowany prowadzący (patrz linia ' + teacherMap[id].line + ')', lineNum);
    }
    if (isNaN(pensum)) {
      return error('Pensum musi być liczbą', lineNum);
    }

    teacherMap[id] = {
      line: lineNum, pensum: pensum, groups: [], firstName: firstName, lastName: lastName
    };
  };

  var validateGroupLine = function(line, lineNum, teacherMap, groupMap, termMap) {
    if (line.length !== 7) {
      return error('Linia zawiera ' + line.length + ' elementów zamiast 7', lineNum);
    }

    var term = line[0];
    var course = line[2];
    var group = line[3];
    var hours = parseInt(line[4]);
    var teachers = line[5].split(',');

    var nonExistingTeacher = _.find(teachers, teacher => teacherMap[teacher] === undefined);
    if (nonExistingTeacher !== undefined) {
      return error('Nieznany prowadzący "' + nonExistingTeacher + '"', lineNum);
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
    if (termMap[term] === undefined) {
      termMap[term] = new Set();
    }

    termMap[term].add(course);

    _.each(teachers, teacher => {
      var data = {teacher: teacher, hours: hours, course: course, term: term, groupType: group};
      groupMap[course][group].push(data);
      teacherMap[teacher].groups.push(data);
    });
  };

  var validateAll = function(teacherMap, lines) {
    var result = [];

    // handle pensum warnings
    _.each(teacherMap, (value, key) => {
      var hours = _.reduce(_.map(value.groups, x => x.hours), (memo, num) => memo + num, 0);
      if (hours * 15 !== value.pensum) {
        result.push(warning('Pensum dla "' + key + '" się nie zgadza: jest ' + hours * 15 + ' godzin zamiast ' + value.pensum, value.line));
      }
    });

    // handle wrong groups ids
    var groupIds = {};
    _.each(lines, (line, lineNum) => {
      if (line[0] === '1' || line[0] === '2') {
        var groupId = line[1];
        if (groupIds[groupId] !== undefined) {
          result.push(error(
            `Zduplikowane id grupy ${groupId}. Oryginał w lini ${groupIds[groupId]}`,
            lineNum
          ));
        } else {
          groupIds[groupId] = lineNum;
        }
      }
    });
    return result;
  };

  File.prototype.validate = function() {
    var file = this;

    return $q(function(resolve) {
      var validationMessages = [];
      var lines = file.content.split('\n').map(x => x.split('|'));
      var teacherMap = {}, err, groupMap = {}, termMap = {};

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
          err = validateGroupLine(line, lineNum, teacherMap, groupMap, termMap);
          if (err !== undefined) {
            validationMessages.push(err);
          }
        }
      });

      // handle summary
      err = validateAll(teacherMap, lines);
      if (err !== undefined) {
        validationMessages = validationMessages.concat(err);
      }

      file.errors = validationMessages;
      file.hasErrors = _.some(validationMessages, message => message.type === 'err');

      file.teacherMap = teacherMap;
      file.groupMap = groupMap;
      file.termMap = termMap;

      resolve();
    });
  };

  return File;
}]);
