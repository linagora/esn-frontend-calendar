'use strict';

angular.module('esn.calendar.libs')
  .component('calAttendeeTabs', {
    template: require('./attendee-tabs.pug'),
    bindings: {
      event: '=',
      selectedTab: '='
    }
  });
