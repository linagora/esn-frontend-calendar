require('./event-preview-popover.controller');
require('./comma-separated-resource-list.filter');
require('./attendee-part-stat-text.filter');
require('./event-date-time-format.filter');

angular.module('esn.calendar.libs')
  .component('eventPreviewPopover', {
    template: require('./event-preview-popover.pug'),
    controller: 'CalEventPreviewPopoverController',
    bindings: {
      event: '='
    }
  });
