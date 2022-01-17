/* eslint-disable space-before-blocks */
require('../app.constants.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs')
    .factory('calendarVisibilityService', calendarVisibilityService);

  function calendarVisibilityService($rootScope, CAL_EVENTS, localStorageService) {
    var storage = localStorageService.getOrCreateInstance('calendarStorage');

    return {
      getHiddenCalendars: getHiddenCalendars,
      isHidden,
      toggle,
      showAndHideCalendars,
      getHiddenCalendarsByType
    };

    ////////////

    function isHidden(calendar) {
      return storage.getItem(calendar.getUniqueId()).then(function(value) {
        return Boolean(value);
      });
    }

    function showAndHideCalendars(calendar, status, calendarType) {
      var calId = calendar.getUniqueId();

      storage.getItem(calendarType + calId).then(function(hiddenBefore) {
        return storage.setItem(calendarType + calId, hiddenBefore);
      }).then(function(hidden) {
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {
          calendarUniqueId: calId,
          calendarType: calendarType,
          hidden: status ? true : hidden
        });
      });
    }

    function toggle(calendar, calendarType, lengthCalendars) {

      var calId = calendar.getUniqueId();

      storage.getItem(calendarType + calId).then(function(hiddenBefore) {

        return storage.setItem(calendarType + calId, !hiddenBefore);
      }).then(function(hidden) {
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {
          calendarUniqueId: calId,
          calendarType: calendarType,
          hidden: hidden
        });

      }).then(function(){
        return getHiddenCalendarsByType(calendarType);
      })
        .then(function(hiddenCal) {
          let hidden = false;

          if (hiddenCal.length === lengthCalendars) {
            hidden = true;
          }

          $rootScope.$broadcast('calendarsAreHidden', {
            calendarType: calendarType,
            hidden: hidden
          });

        });
    }

    function getHiddenCalendarsByType(calendarType) {
      var result = [];

      return storage.iterate(function(hidden, id) {

        if (id.startsWith(calendarType) && hidden) {
          result.push(id);
        }
      }).then(function() {
        return result;
      });
    }

    function getHiddenCalendars() {
      var result = [];

      return storage.iterate(function(hidden, id) {
        if (hidden) {
          result.push(id);
        }
      }).then(function() {
        return result;
      });
    }
  }
})(angular);
