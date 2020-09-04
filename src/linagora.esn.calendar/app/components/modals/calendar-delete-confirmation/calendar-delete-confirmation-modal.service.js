(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calCalendarDeleteConfirmationModalService', calCalendarDeleteConfirmationModalService);

  function calCalendarDeleteConfirmationModalService($modal) {
    return function(calendar, onConfirm) {
      return $modal({
        template: require('./calendar-delete-confirmation-modal.pug'),
        controller: function() {
          this.calendarName = calendar.name;
          this.delete = onConfirm;
          this.isShared = calendar.isSubscription() || calendar.isDelegated();
        },
        controllerAs: 'ctrl',
        backdrop: 'static',
        placement: 'center'
      });
    };
  }
})(angular);
