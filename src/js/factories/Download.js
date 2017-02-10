'use strict';

angular.module('schedulerApp').factory('Download', [
  'CondensedTimeTableObj', function(CondensedTimeTableObj) {

    let padR = function(num, size) {
      let s = num + '          ';
      return s.substr(0, size);
    };

    let textToHtml = function(text) {
      return text.replace(/\n/g, '<br>');
    };

    class Download {

      constructor(config) {
        this.config = config;

        this.text = {
          teacher: this.getTextTeacher(),
          room: this.getTextRoom(),
          course: this.getTextCourse(),
          term: this.getTextTerm()
        };
        this.html = {
          teacher: textToHtml(this.text.teacher),
          room: textToHtml(this.text.room),
          course: textToHtml(this.text.course),
          term: textToHtml(this.text.term)
        };
      }

      getTextTeacher() {
        let teachers = _.sortBy(this.config.teachers, x => x.extra.lastName);

        return _.map(teachers, teacher => {

          let condensedTimetable = CondensedTimeTableObj.init(teacher.timetable);

          let teacherTimetables = [];
          _.each(condensedTimetable, x => {

            let hoursStr = padR(`${x.start.hour}-${x.end.hour}`, 5);
            let termStr = `${padR(x.getDayHumanReadable(), 3)} ${hoursStr}`;
            let courseStr = `${x.group.extra.course.toUpperCase()} (${x.group.extra.groupTypeFull})`;
            let roomNumsStr = x.rooms.map(x => x.id).join(',');
            let roomStr = x.rooms.length > 1 ? `sale ${roomNumsStr}` : `sala ${roomNumsStr}`;

            teacherTimetables.push({
              sort: x.day * 100 + x.start.hour,
              text: `  ${termStr} ${courseStr} ${roomStr}`
            });

          });
          let timetableStr = _.chain(teacherTimetables)
            .sortBy(x => x.sort)
            .map(x => x.text)
            .join('\n');
          let teacherStr = `${teacher.extra.lastName.toUpperCase()} ${teacher.extra.firstName.toUpperCase()}`;
          return `${teacherStr}\n${timetableStr}`;
        }).join('\n\n');
      }

      getTextRoom() {
        let rooms = _.sortBy(this.config.rooms, x => x.id);

        return _.map(rooms, room => {

          let condensedTimetable = CondensedTimeTableObj.init(room.timetable);

          let roomTimetables = [];
          _.each(condensedTimetable, x => {

            let hoursStr = padR(`${x.start.hour}-${x.end.hour}`, 5);
            let termStr = `${padR(x.getDayHumanReadable(), 3)} ${hoursStr}`;
            let courseStr = `${x.group.extra.course.toUpperCase()} (${x.group.extra.groupTypeFull})`;
            let teachersStr = _.chain(x.group.teachers)
              .sortBy(x => x.extra.lastName)
              .map(x => `${x.extra.lastName.toUpperCase()} ${x.extra.firstName.toUpperCase()}`)
              .join(', ');

            roomTimetables.push({
              sort: x.day * 100 + x.start.hour + x.day * 100 + x.end.hour,
              text: `  ${termStr} ${courseStr} ${teachersStr}`
            });

          });
          let timetableStr = _.chain(roomTimetables)
            .sortBy(x => x.sort)
            .map(x => x.text)
            .join('\n');
          return `${room.id}\n${timetableStr}`;
        }).join('\n\n');
      }

      getTextCourse() {

        return _.chain(CondensedTimeTableObj.init(this.config.timetable))
          .sortBy(
            x => x.day * 100 + x.start.hour + x.day * 100 + x.end.hour
          )
          .groupBy(x => x.group.extra.course.toUpperCase())
          .map((xs, course) => {
            let courseTimetable = _.map(xs, x => {

              let hoursStr = padR(`${x.start.hour}-${x.end.hour}`, 5);
              let termStr = `${padR(x.getDayHumanReadable(), 3)} ${hoursStr}`;
              let courseStr = `(${x.group.extra.groupTypeFull})`;
              let roomNumsStr = x.rooms.map(x => x.id).join(',');
              let roomStr = x.rooms.length > 1 ? `sale ${roomNumsStr}` : `sala ${roomNumsStr}`;
              let teachersStr = _.chain(x.group.teachers)
                .sortBy(x => x.extra.lastName)
                .map(x => `${x.extra.lastName.toUpperCase()} ${x.extra.firstName.toUpperCase()}`)
                .join(', ');

              return `${termStr} ${courseStr} ${teachersStr}, ${roomStr}`;

            }).join('\n');

            return `${course}\n${courseTimetable}`;
          })
          .sortBy(x => x)
          .value()
          .join('\n\n');

      }

      getTextTerm() {

        return _.chain(CondensedTimeTableObj.init(this.config.timetable))
          .sortBy(
            x => x.day * 100 + x.start.hour + x.day * 100 + x.end.hour
          )
          .map(x => {

            let hoursStr = padR(`${x.start.hour}-${x.end.hour}`, 5);
            let termStr = `${padR(x.getDayHumanReadable(), 3)} ${hoursStr}`;
            let courseStr = `${x.group.extra.course.toUpperCase()} (${x.group.extra.groupTypeFull})`;
            let roomNumsStr = x.rooms.map(x => x.id).join(',');
            let roomStr = x.rooms.length > 1 ? `sale ${roomNumsStr}` : `sala ${roomNumsStr}`;
            let teachersStr = _.chain(x.group.teachers)
              .sortBy(x => x.extra.lastName)
              .map(x => `${x.extra.lastName.toUpperCase()} ${x.extra.firstName.toUpperCase()}`)
              .join(', ');

            return `${termStr} ${courseStr} ${teachersStr}, ${roomStr}`;

          })
          .value()
          .join('\n');

      }

    }

    return Download;
  }]
);
