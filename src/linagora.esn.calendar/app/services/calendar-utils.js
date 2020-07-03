(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calendarUtils', calendarUtils);

  function calendarUtils(calMoment, esnI18nService, CAL_TRANSLATED_DEFAULT_NAME) {
    var service = {
      prependMailto: prependMailto,
      removeMailto: removeMailto,
      fullmailOf: fullmailOf,
      getNewStartDate: getNewStartDate,
      getNewEndDate: getNewEndDate,
      getDateOnCalendarSelect: getDateOnCalendarSelect,
      getTranslatedDefaultName: getTranslatedDefaultName
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
  }

})();
