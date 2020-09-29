'use strict';

angular.module('esn.calendar.libs')
  .controller('calTimeSelectController', calTimeSelectController);

function calTimeSelectController($scope, calMoment) {
  const self = this;
  let locale;
  let timeFormat;

  self.$onInit = onInit;
  self.onSelectedTimeChange = onSelectedTimeChange;
  self.onSetSelectedTime = onSetSelectedTime;
  self.onTimeSelectBlur = onTimeSelectBlur;

  function onInit() {
    locale = self.locale;
    timeFormat = self.timeFormat;
    self.timeOptions = getTimeOptions();
    self.isInputValid = true;
    self.selectedTime = this.date.format(timeFormat);

    // $watch for handling the offset being added to the date
    $scope.$watch('ctrl.date', function(newDate) {
      initTimeInput(newDate);
    });
  }

  function getTimeOptions() {
    const options = [];

    [...Array(24).keys()].map(hour => {
      options.push(calMoment({ hour }).locale(locale).format(timeFormat));
      options.push(calMoment({ hour, minute: 15 }).locale(locale).format(timeFormat));
      options.push(calMoment({ hour, minute: 30 }).locale(locale).format(timeFormat));
      options.push(calMoment({ hour, minute: 45 }).locale(locale).format(timeFormat));
    });

    return options;
  }

  function initTimeInput(date) {
    if (date) {
      self.selectedTime = date.format(timeFormat);
    }
  }

  function onSelectedTimeChange() {
    if (calMoment(self.selectedTime, timeFormat, true).isValid()) {
      const { hour, minute } = parseSelectedTime(self.selectedTime);

      self.isInputValid = true;

      self.date.set({
        hour,
        minute
      });

      self.onTimeChange();
    } else {
      self.isInputValid = false;
    }
  }

  function parseSelectedTime(timeString) {
    const time = calMoment(timeString, timeFormat);

    return {
      hour: time.hour(),
      minute: time.minute()
    };
  }

  function onSetSelectedTime(timeString) {
    self.selectedTime = timeString;

    onSelectedTimeChange();
  }

  // on blur, resets the input to the original time if it's not valid
  function onTimeSelectBlur() {
    if (!self.isInputValid) {
      initTimeInput(self.date);
      self.isInputValid = true;
    }
  }
}
