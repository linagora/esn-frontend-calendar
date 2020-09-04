'use strict';

angular.module('esn.calendar.libs')
  .factory('calEventFreeBusyConfirmationModalService', calEventFreeBusyConfirmationModalService);

function calEventFreeBusyConfirmationModalService($modal) {
  return function(onConfirm, onEdit, onCancel) {
    return $modal({
      template: require('./event-freebusy-confirmation-modal.pug'),
      controller: function() {
        this.submit = onConfirm;
        this.edit = function() {
          onEdit && onEdit();
        };
        this.displayEdit = onEdit;
        this.cancel = function() {
          onCancel && onCancel();
        };
      },
      controllerAs: 'ctrl',
      backdrop: 'static',
      placement: 'center'
    });
  };
}
