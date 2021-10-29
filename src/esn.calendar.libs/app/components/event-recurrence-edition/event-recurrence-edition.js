/* eslint-disable radix */
const moment = require('moment');

require('../../core/date-to-moment.directive.js');
require('../../services/fc-moment.js');
require('../../app.constants.js');

'use strict';

angular.module('esn.calendar.libs')
  .directive('eventRecurrenceEdition', eventRecurrenceEdition);

function eventRecurrenceEdition() {
  var directive = {
    restrict: 'E',
    template: require('./event-recurrence-edition.pug'),
    scope: {
      _event: '=event',
      canModifyEventRecurrence: '=?'
    },
    replace: true,
    controller: EventRecurrenceEditionController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

}

function EventRecurrenceEditionController(esnI18nService, calMoment, detectUtils, CAL_RECUR_FREQ, CAL_WEEK_DAYS, CAL_MAX_RRULE_COUNT, CAL_OCCURENCE_DAY) {
  var self = this;

  self.event = self._event;
  self.getMinDate = getMinDate;
  self.CAL_RECUR_FREQ = CAL_RECUR_FREQ;
  self.toggleWeekdays = toggleWeekdays;
  self.resetUntil = resetUntil;
  self.setDefaultUntilDate = setDefaultUntilDate;
  self.resetCount = resetCount;
  self.setRRULE = setRRULE;
  self.CAL_MAX_RRULE_COUNT = CAL_MAX_RRULE_COUNT;
  self.isMobile = detectUtils.isMobile();
  self.onMobileUntilDateChange = onMobileUntilDateChange;
  self.CAL_OCCURENCE_DAY = CAL_OCCURENCE_DAY;
  self.CAL_WEEK_DAYS = CAL_WEEK_DAYS;
  self.setOccurrenceDay = setOccurrenceDay;
  self.resetByDay = resetByDay;
  activate();

  ////////////

  function getMinDate() {
    var calNow = calMoment();
    var calEventStart = calMoment(self.event.start);
    var calMin = calNow.isBefore(calEventStart) ? calEventStart : calNow;

    return calMin.format('YYYY-MM-DD');
  }

  function activate() {
    self._event.getModifiedMaster().then(function(master) {
      self.event = master;
      self.freq = self.event.rrule ? self.event.rrule.freq : undefined;
      self.byday = self.event.rrule ? self.event.rrule.byday : [];
      self.days = generateDays();
      self.occurrence = self.byday && self.byday[0] && self.byday[0].split(/([0-9]+)/)[1];
      self.day = self.byday && self.byday[0] && self.byday[0].split(/([0-9]+)/)[2];
      self.bymonthday = parseInt(calMoment(self.event.start).format('D'));

      if (self.event.rrule && self.event.rrule.until && self.event.rrule.until._isAMomentObject) {
        self.eventUntil = self.event.rrule.until.toDate();
      }
    });
  }

  function generateDays() {
    var localeMoment = moment().locale(esnI18nService.getLocale());
    var selectedDays = (self.event.rrule && self.event.rrule.byday) ? self.event.rrule.byday : [];

    return angular.copy(CAL_WEEK_DAYS).map(function(day) {
      day.selected = selectedDays.indexOf(day.value) >= 0;
      day.shortName = localeMoment.day(esnI18nService.translate(day.label).toString()).format('dd');

      return day;
    });
  }

  function toggleWeekdays(value) {
    var index = self.event.rrule.byday.indexOf(value);
    var newDays = self.event.rrule.byday.slice();

    if (index > -1) {
      newDays.splice(index, 1);
    } else {
      newDays.push(value);
    }

    self.event.rrule.byday = sortDays(newDays);
  }

  function sortDays(days) {
    var weekDaysValues = CAL_WEEK_DAYS.map(function(day) {
      return day.value;
    });

    return days.sort(function(dayA, dayB) {
      if (weekDaysValues.indexOf(dayA) > weekDaysValues.indexOf(dayB)) {
        return 1;
      } if (weekDaysValues.indexOf(dayA) < weekDaysValues.indexOf(dayB)) {
        return -1;
      }

      return 0;
    });
  }

  function resetUntil() {
    self.event.rrule.until = undefined;
    self.eventUntil = undefined;
  }

  function resetCount() {
    self.event.rrule.count = undefined;
  }

  function resetByDay() {
    self.occurrence = undefined;
    self.day = undefined;
    self.event.rrule.byday = undefined;
  }

  function setDefaultUntilDate(freq) {
    if (!self.canModifyEventRecurrence || self.event.rrule.until) {
      return;
    }

    var until = new Date();

    switch (freq) {
    case 'DAILY': {
      until.setDate(until.getDate() + 1);
      break;
    }
    case 'WEEKLY': {
      until.setDate(until.getDate() + 7);
      break;
    }
    case 'MONTHLY': {
      until.setMonth(until.getMonth() + 1);
      break;
    }
    case 'YEARLY': {
      until.setFullYear(until.getFullYear() + 1);
      break;
    }
    }
    resetCount();
    self.event.rrule.until = until; // this assignment converts the date object to a moment Object
    self.eventUntil = until; // so we can't use the event object, instead we use a dedicated model
  }

  function setRRULE() {
    if (!self.freq) {
      self.event.rrule = undefined;
    } else {
      self.event.rrule = {
        freq: self.freq,
        interval: self.event.rrule && self.event.rrule.interval || 1,
        byday: self.byday
      };
    }
  }

  function setOccurrenceDay(occ, day) {
    self.byday = [];
    self.byday.push(occ + day);
    self.event.rrule.byday = self.byday;
  }

  function onMobileUntilDateChange() {
    // check if we have a valid Date
    if (self.eventUntil instanceof Date === false || Number.isNaN(self.eventUntil.valueOf())) return;

    // set the event until date using the selected date from the mobile input
    self.event.rrule.until = self.eventUntil;
  }
}
