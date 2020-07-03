(function() {
  'use strict';

  angular.module('esn.calendar')
         .factory('calendarVisibilityService', calendarVisibilityService);

  function calendarVisibilityService($rootScope, _, CAL_EVENTS, localStorageService) {
    var storage = localStorageService.getOrCreateInstance('calendarStorage');

    return {
      getHiddenCalendars: getHiddenCalendars,
      isHidden: isHidden,
      toggle: toggle
    };

    ////////////

    function isHidden(calendar) {
      return storage.getItem(calendar.getUniqueId()).then(function(value) {
        return Boolean(value);
      });
    }

    function toggle(calendar) {
      var calId = calendar.getUniqueId();

      storage.getItem(calId).then(function(hiddenBefore) {
        return storage.setItem(calId, !hiddenBefore);
      }).then(function(hidden) {
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {
          calendarUniqueId: calId,
          hidden: hidden
        });

        return hidden;
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
})();
