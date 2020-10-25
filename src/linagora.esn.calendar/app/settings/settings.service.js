'use strict';

angular.module('esn.calendar')
  .service('calSettingsService', calSettingsService);

function calSettingsService($rootScope, $state, UPDATE_CAL_SETTINGS) {
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

    return self.forceUpdate;
  }

  function getStatus() {
    return self.status;
  }

  function updateStatus(newStatus, options) {
    self.status = newStatus;

    $rootScope.$broadcast(UPDATE_CAL_SETTINGS, self.status, options);

    if (self.forceUpdate) {
      console.log(self.forceUpdate);
      $state.reload();
    }
  }
}
