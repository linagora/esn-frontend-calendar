(function(angular) {
  'use strict';

  angular.module('esn.calendar').factory('calFreebusyHooksService', calFreebusyHooksService);

  function calFreebusyHooksService(
    $log,
    calFreebusyService,
    calEventFreeBusyConfirmationModalService
  ) {
    return {
      onUpdate: onUpdate
    };

    function onUpdate(event, updateFn, editFn, cancelFn) {
      calFreebusyService.areAttendeesAvailable(event.attendees, event.start, event.end, [event])
        .then(function(free) {
          if (!free) {
            calEventFreeBusyConfirmationModalService(updateFn, editFn, cancelFn);
          } else {
            updateFn();
          }
        })
        .catch(function(err) {
          $log.error('Can not deep check freebusy', err);
          updateFn();
        });
    }
  }
})(angular);
