require('./open-event-form.service.js');
require('./open-event-from-search-form.service.js');

'use strict';

angular.module('esn.calendar.libs')
  .component('calOpenEventFormOnClick', {
    bindings: {
      calendarHomeId: '<',
      event: '<',
      isEventFromSearch: '<'
    },
    controller: CalOpenEventFormOnClickController
  }
);

function CalOpenEventFormOnClickController($element, calOpenEventForm, calOpenEventFromSearchForm) {
  var self = this;

  $element.on('click', function() {
    if (!self.isEventFromSearch) {
      return calOpenEventForm(self.calendarHomeId, self.event);
    }

    calOpenEventFromSearchForm(self.event);
  });
}