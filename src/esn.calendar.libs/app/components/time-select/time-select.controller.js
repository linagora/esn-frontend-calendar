'use strict';

require('../../services/fc-moment.js');

angular.module('esn.calendar.libs')
  .controller('calTimeSelectController', calTimeSelectController);

function calTimeSelectController($scope, $element, calMoment, ESN_I18N_SUPPORTED_MOMENT_LOCALES_MAPPING) {
  const self = this;

  self.$onInit = onInit;
  self.onTimeInputChange = onTimeInputChange;
  self.onSelectingTimeOption = onSelectingTimeOption;
  self.onTimeSelectBlur = onTimeSelectBlur;
  self.onInputKeydown = onInputKeydown;

  function onInit() {
    self.locale = ESN_I18N_SUPPORTED_MOMENT_LOCALES_MAPPING[self.locale] || 'en';
    self.timeOptions = getTimeOptions();
    self.isInputValid = true;
    self.selectedTime = this.date.locale(self.locale).format(self.timeFormat);

    // $watch for handling the offset being added to the date
    $scope.$watch('ctrl.date', function(newDate) {
      initTimeInput(newDate);
    });

    // The input field is added to the click refs so that the dropdwon doesn't close when clicking inside the input
    $scope.additionalClickRefs = [$element.find('input')[0]];
  }

  function onInputKeydown(event, mdMenu) {
    if (event.key === 'Tab') return mdMenu.close();
    if (event.key !== 'Enter') return;

    event.preventDefault();

    onTimeSelectBlur();
    mdMenu.close();
  }

  function getTimeOptions() {
    const options = [];

    [...Array(24).keys()].map(hour => {
      options.push(calMoment({ hour }).locale(self.locale).format(self.timeFormat));
      options.push(calMoment({ hour, minute: 15 }).locale(self.locale).format(self.timeFormat));
      options.push(calMoment({ hour, minute: 30 }).locale(self.locale).format(self.timeFormat));
      options.push(calMoment({ hour, minute: 45 }).locale(self.locale).format(self.timeFormat));
    });

    return options;
  }

  function initTimeInput(date) {
    if (!date) return;

    self.selectedTime = date.locale(self.locale).format(self.timeFormat);
  }

  function onTimeInputChange() {
    const momentTime = calMoment(self.selectedTime, self.timeFormat);

    if (!momentTime.isValid()) {
      self.isInputValid = false;

      return;
    }

    self.isInputValid = true;
  }

  function onSelectingTimeOption(timeString) {
    self.selectedTime = timeString;

    _setTimeFromString(self.selectedTime);
  }

  function onTimeSelectBlur() {
    if (!self.isInputValid) {
      initTimeInput(self.date);
      self.isInputValid = true;
    }

    _setTimeFromString(self.selectedTime);
  }

  function _setTimeFromString(timeString) {
    const momentTime = calMoment(timeString, self.timeFormat, self.locale);

    self.date.set({
      hour: momentTime.hour(),
      minute: momentTime.minute()
    });

    self.selectedTime = self.date.format(self.timeFormat);
    self.onTimeChange();
  }
}
