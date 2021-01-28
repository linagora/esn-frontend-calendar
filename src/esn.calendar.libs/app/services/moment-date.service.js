'use strict';

angular.module('esn.calendar.libs')
  .factory('calMomentDateService', momentDate);

function momentDate() {

  return {
    momentToDate,
    getDateComponents
  };

  /**
   * @param {Object} momentObject A moment object.
   *
   * @return {Date} The equivalent Date object.
   */
  function momentToDate(momentObject) {
    if (!momentObject || !momentObject._isAMomentObject) return;

    const date = momentObject.toDate();

    date.setMonth(momentObject.month());
    date.setDate(momentObject.date());
    date.setFullYear(momentObject.year());
    date.setHours(momentObject.hours());
    date.setMinutes(momentObject.minutes());

    return date;
  }

  /**
   * @param {Date} date A Date Object.
   *
   * @return {Object} An object containing the year, month, date, hour and minute of a Date Object.
   */
  function getDateComponents(date) {
    if (date instanceof Date === false) return;

    return {
      minute: date.getMinutes(),
      hour: date.getHours(),
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    };
  }
}
