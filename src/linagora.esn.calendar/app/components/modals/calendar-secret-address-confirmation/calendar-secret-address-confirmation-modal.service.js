'use strict';

angular.module('esn.calendar')
  .factory('calCalendarSecretAddressConfirmationModalService', calCalendarSecretAddressConfirmationModalService);

function calCalendarSecretAddressConfirmationModalService($modal) {
  return function(calendar, onConfirm) {
    return $modal({
      template: require('./calendar-secret-address-confirmation-modal.pug'),
      controller: function() {
        this.calendarName = calendar.name;
        this.delete = onConfirm;
      },
      controllerAs: 'ctrl',
      backdrop: 'static',
      placement: 'center'
    });
  };
}
