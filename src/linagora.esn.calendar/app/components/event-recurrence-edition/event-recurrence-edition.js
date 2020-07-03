(function() {
  'use strict';

  angular.module('esn.calendar')
    .directive('eventRecurrenceEdition', eventRecurrenceEdition);

  function eventRecurrenceEdition() {
    var directive = {
      restrict: 'E',
      template: require("./event-recurrence-edition.pug"),
      scope: {
        _event: '=event',
        canModifyEventRecurrence: '=?'
      },
      link: link,
      replace: true,
      controller: EventRecurrenceEditionController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    ////////////

    function link(scope, element, attrs, vm) { // eslint-disable-line no-unused-vars
      scope.selectEndRadioButton = selectEndRadioButton;

      function selectEndRadioButton(index) {
        var radioButtons = element.find('input[name="inlineRadioEndOptions"]');

        radioButtons[index].checked = true;
        // reset event.rrule.until if we are clicking on After ... occurrences input.
        if (index === 1) {
          vm.resetUntil();
        }
        // reset event.rrule.until if we are clicking on At ... input.
        if (index === 2) {
          vm.resetCount();
        }
      }
    }
  }

  function EventRecurrenceEditionController(moment, calMoment, esnI18nService, CAL_RECUR_FREQ, CAL_WEEK_DAYS, CAL_MAX_RRULE_COUNT) {
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
        self.days = generateDays();
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
        } else if (weekDaysValues.indexOf(dayA) < weekDaysValues.indexOf(dayB)) {
          return -1;
        }

        return 0;
      });
    }

    function resetUntil() {
      self.event.rrule.until = undefined;
    }

    function resetCount() {
      self.event.rrule.count = undefined;
    }

    function setDefaultUntilDate(freq) {
      if (self.event.rrule.until) {
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
      self.event.rrule.until = until;
    }

    function setRRULE() {
      if (!self.freq) {
        self.event.rrule = undefined;
      } else {
        self.event.rrule = {
          freq: self.freq,
          interval: self.event.rrule && self.event.rrule.interval || 1
        };
      }
    }
  }
})();
