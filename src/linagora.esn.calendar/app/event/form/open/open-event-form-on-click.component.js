(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calOpenEventFormOnClick', {
      bindings: {
        calendarHomeId: '<',
        event: '<',
        isEventFromSearch: '<'
      },
      controller: CalOpenEventFormOnClickController
    }
  );

  function CalOpenEventFormOnClickController($element, _, calOpenEventForm, calOpenEventFromSearchForm) {
    var self = this;

    $element.on('click', function() {
      if (!self.isEventFromSearch) {
        return calOpenEventForm(self.calendarHomeId, self.event);
      }

      calOpenEventFromSearchForm(self.event);
    });
  }
})();
