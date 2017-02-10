'use strict';

angular.module('schedulerApp').factory('CondensedTimeTableObj', [function() {

  let dayNames = {
    0: 'pn',
    1: 'wt',
    2: 'sr',
    3: 'czw',
    4: 'pt',
    5: 'sb',
    6: 'nd'
  };

  class CondensedTimeTableObj {

    constructor(group, terms, rooms, day, start, end) {
      this.group = group;
      this.rooms = rooms;
      this.terms = terms;
      this.day = day;
      this.start = start;
      this.end = end;
    }

    getDayHumanReadable() {
      return dayNames[this.day];
    }

    static init(timeTableObjs) {

      let timetable = {};

      _.each(timeTableObjs, x => {
        let teachersKey = _.chain(x.teachers).map(x => x.id).sortBy(x => x).value().join('-');
        let key = `${x.group.extra.course}:${x.group.extra.groupType}:${teachersKey}`;
        let added = false;

        if (timetable[key] !== undefined) {
          for (let i = 0; i < timetable[key].length; i++) {
            let termGroup = timetable[key][i];

            if (termGroup.group.id !== x.group.id) {
              continue;
            }

            if (x.term.day === termGroup.day && x.term.end.hour === termGroup.start.hour) {
              added = true;
              termGroup.start = x.term.start;
              termGroup.objs.push(x);
            } else if (
              x.term.day === termGroup.day &&  termGroup.end.hour === x.term.start.hour
            ) {
              added = true;
              termGroup.end = x.term.end;
              termGroup.objs.push(x);
            }
          }
        }
        if (timetable[key] === undefined || !added) {
          let newItem = {
            start: x.term.start, end: x.term.end, day: x.term.day, objs: [x], group: x.group
          };
          if (timetable[key] === undefined) {
            timetable[key] = [];
          }
          timetable[key].push(newItem);
        }
      });

      let condensedTimetable = [], group, terms, rooms;
      _.each(timetable, values => {
        _.each(values, value => {
          group = _.chain(value.objs).map(x => x.group).uniq(x => x.id).value()[0];
          terms = _.chain(value.objs).map(x => x.term).uniq(x => x.id).value();
          rooms = _.chain(value.objs).map(x => x.room).uniq(x => x.id).value();

          condensedTimetable.push(new CondensedTimeTableObj(
            group, terms, rooms, value.day, value.start, value.end
          ));
        });
      });

      return condensedTimetable;
    }

  }

  return CondensedTimeTableObj;
}]);
