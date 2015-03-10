'use strict';
/*global angular */

angular.module('schedulerApp').controller('CalendarController', [
  function () {

    var init = function() {
      var d = 2, m = 1, y = 2015;
      console.log('CalendarController', $('#calendar'));
      $('#calendar').fullCalendar({
            defaultView: 'schedulerAgenda',
            defaultDate: new Date(y, m, d),
            header: {
              left: '',
              center: '',
              right: ''
            },
            start: '2015-03-02 08:00:00',
            intervalStart: '2015-03-02 08:00:00',
            views: {
              schedulerAgenda: {
                type: 'agenda',
                duration: {days: 5},
                buttonText: 'scheduler',
                allDaySlot: false,
                slotDuration: '00:30:00',
                minTime: '08:00:00',
                maxTime: '22:00:00',
                firstDay: 1,
                axisFormat: 'hh:mm',
                columnFormat: 'dddd'
              }
            },
            events: [
              {
                title: 'Meeting',
                start: new Date(y, m, d, 10, 30),
                allDay: false,
                backgroundColor: '#0073b7',
                borderColor: '#0073b7'
              }
            ]
          });
    };

    init();
  }
]);
