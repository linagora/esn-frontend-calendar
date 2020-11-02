'use strict';

angular.module('esn.calendar')
  .service('calSettingsService', calSettingsService);

function calSettingsService($rootScope, $state) {
  const self = this;

  self.status = 'initial';
  self.forceUpdate = false;

  return {
    setForceUpdate,
    getStatus,
    updateStatus
  };

  function setForceUpdate(forceUpdate = true) {
    self.forceUpdate = forceUpdate;
  }

  function getStatus() {
    return self.status;
  }

  function updateStatus(newStatus, options) {
    self.status = newStatus;

    $rootScope.$broadcast('cal-settings:status:updated', self.status, options);

    if (self.forceUpdate) {
      $state.reload();
    }
  }
}
