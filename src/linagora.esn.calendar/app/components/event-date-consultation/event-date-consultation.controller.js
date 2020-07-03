(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('calEventDateConsultationController', calEventDateConsultationController);

  function calEventDateConsultationController(calMoment) {
    var self = this;
    var isFull24HoursDay = self.event.full24HoursDay;
    var isOverOneDayOnly = self.event.isOverOneDayOnly();
    var eventStart = calMoment(self.event.start);
    var eventEnd = calMoment(self.event.end);

    formatStartDate();
    formatEndDate();

    function formatStartDate() {
      if (isFull24HoursDay) {
        self.start = eventStart.format('MMM D');

        return;
      }

      self.start = eventStart.format('MMM D HH:mm');
    }

    function formatEndDate() {
      if (isFull24HoursDay) {
        self.end = isOverOneDayOnly ? undefined : eventEnd.clone().subtract(1, 'day').format('MMM D');

        return;
      }

      self.end = isOverOneDayOnly ? eventEnd.format('HH:mm') : self.end = eventEnd.format('MMM D HH:mm');
    }
  }
})();
