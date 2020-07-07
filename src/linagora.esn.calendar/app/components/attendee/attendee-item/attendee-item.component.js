(function(angular) {
'use strict';

angular.module('esn.calendar')
  .component('calAttendeeItem', {
    template: require("./attendee-item.pug"),
    bindings: {
      attendee: '=',
      canModifyAttendee: '=',
      isOrganizer: '=',
      remove: '&'
    },
    controller: 'CalAttendeeItemController',
    controllerAs: 'ctrl'
  });
})(angular);
