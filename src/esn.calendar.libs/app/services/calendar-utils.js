require('../app.constants.js');
require('./fc-moment.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs')
    .factory('calendarUtils', calendarUtils);

  function calendarUtils($rootScope, calMoment, esnI18nService, calCachedEventSource, notificationFactory, CAL_TRANSLATED_DEFAULT_NAME, CAL_EVENTS) {
    var service = {
      prependMailto: prependMailto,
      removeMailto: removeMailto,
      fullmailOf: fullmailOf,
      getNewStartDate: getNewStartDate,
      getNewEndDate: getNewEndDate,
      getDateOnCalendarSelect: getDateOnCalendarSelect,
      getTranslatedDefaultName: getTranslatedDefaultName,
      notifyErrorWithRefreshCalendarButton: notifyErrorWithRefreshCalendarButton
    };

    return service;

    ////////////

    /**
     * Prepend a mail with 'mailto:'
     * @param {String} mail
     */
    function prependMailto(mail) {
      return 'mailto:' + mail;
    }

    /**
     * Remove (case insensitive) mailto: prefix
     * @param {String} mail
     */
    function removeMailto(mail) {
      return mail.replace(/^mailto:/i, '');
    }

    /**
     * Build and return a fullname like: John Doe <john.doe@open-paas.org>
     * @param {String} cn
     * @param {String} mail
     */
    function fullmailOf(cn, mail) {
      return cn ? cn + ' <' + mail + '>' : mail;
    }

    /**
     * Return a calMoment representing (the next half hour) starting from Date.now()
     */
    function getNewStartDate() {
      var now = calMoment();
      var minute = now.minute();

      now.endOf('hour');

      if (minute < 30) {
        now.subtract(30, 'minute');
      }

      return now.add(1, 'seconds');
    }

    /**
     * Return a calMoment representing the result of getNewStartDate + one hour
     */
    function getNewEndDate() {
      return getNewStartDate().add(1, 'hours');
    }

    /**
     * Return the date when selecting a single cell.
     * @param {Date} start
     * @param {Date} end
     */
    function getDateOnCalendarSelect(start, end) {
      return { start: start, end: end };
    }

    function getTranslatedDefaultName() {
      return esnI18nService.translate(CAL_TRANSLATED_DEFAULT_NAME).toString();
    }

    function notifyErrorWithRefreshCalendarButton(message) {
      notificationFactory.strongError('', message)
        .setCancelAction({
          linkText: 'Refresh calendar',
          action: function() {
            calCachedEventSource.resetCache();
            $rootScope.$broadcast(CAL_EVENTS.CALENDAR_REFRESH);
          }
        });
    }
  }

})(angular);
