'use strict';

angular.module('schedulerApp').factory('FileDownload', [
  function() {

    let groupTypeMap = {
      'w': 'wykład',
      'c': 'ćwiczenia',
      'p': 'pracownia',
      'l': 'pracownia',
      'e': 'repetytorium',
      's': 'seminarium',
      'r': 'ćwicz-prac'
    };

    let textToHtml = function(text) {
      return text.replace(/\n/g, '<br>');
    };

    class FileDownload {

      constructor(file) {
        this.file = file;

        this.recount();
      }

      recount() {
        this.text = {
          teacher: this.getTextTeacher(),
          course: this.getTextCourse()
        };
        this.html = {
          teacher: textToHtml(this.text.teacher),
          course: textToHtml(this.text.course)
        };
      }

      getTextTeacher() {
        let fileDownload = this;

        let getTermData = function(termNum, groups) {
          if (fileDownload.file.termMap[termNum] === undefined) { return [0, '']; }

          let termPensum = 0;

          let termStr = _.chain(groups)
            .map(group => {
              if (!fileDownload.file.termMap[termNum].has(group.course)) { return ''; }
              termPensum = termPensum + group.hours;
              return `    ${group.course}, ${groupTypeMap[group.groupType]} (${group.hours})`;
            })
            .sortBy(x => x)
            .filter(x => x)
            .values()
            .join('\n');

          return [termPensum, termStr];
        };

        return _.chain(fileDownload.file.teacherMap)
          .map((teacher, teacherId) => {
              let bilans = _.chain(teacher.groups).map(x => x.hours).reduce((x, y) => x + y, 0) *
                15 - teacher.pensum;

              let [termPensum1, termStr1] = getTermData('1', teacher.groups);
              let [termPensum2, termStr2] = getTermData('2', teacher.groups);

              let groupStr = `Semestr zimowy (${termPensum1} h/tydzień)\n${termStr1}` +
                `\nSemestr letni (${termPensum2} h/tydzień)\n${termStr2}`;

              return `${teacher.lastName} ${teacher.firstName} (${teacherId}),` +
                ` pensum: ${teacher.pensum} h, bilans: ${bilans} h\n${groupStr}`;
            }
          )
          .sortBy(x => x)
          .value()
          .join('\n\n');
      }

      getTextCourse() {
        let fileDownload = this;

        let getTermData = function(termNum) {
          if (fileDownload.file.termMap[termNum] === undefined) { return ''; }

          return _.chain(fileDownload.file.groupMap)
            .map((value, course) => {
              if (!fileDownload.file.termMap[termNum].has(course)) { return ''; }

              let groups = _.map(value, (xs, groupType) => {
                let teachersStr = _.map(xs, x => {
                  let t = fileDownload.file.teacherMap[x.teacher];
                  return `${t.firstName[0]}. ${t.lastName}`;
                }).join(', ');

                return `  ${groupTypeMap[groupType]} (${xs[0].hours} h): ${teachersStr}`;
              }).join('\n');
              return `${course}\n${groups}`;
            })
            .sortBy(x => x)
            .filter(x => x)
            .join('\n\n');
        };

        return `Semestr zimowy\n\n${getTermData('1')}\n\n\nSemestr letni\n\n${getTermData('2')}`;
      }


    }

    return FileDownload;
  }]
);
