const _ = require('lodash');
require('../../../event/form/open/open-event-form.service.js');
require('../../../event/form/open/open-event-from-search-form.service.js');

(function(angular) {
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

  function CalOpenEventFormOnClickController($element, calOpenEventForm, calOpenEventFromSearchForm) {
    var self = this;

    $element.on('click', function() {
      if (!self.isEventFromSearch) {
        return calOpenEventForm(self.calendarHomeId, self.event);
      }

      calOpenEventFromSearchForm(self.event);
    });
  }
})(angular);
