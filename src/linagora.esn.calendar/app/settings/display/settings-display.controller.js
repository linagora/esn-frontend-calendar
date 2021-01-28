'use strict';

const _ = require('lodash');

angular.module('esn.calendar')
  .controller('CalSettingsDisplayController', CalSettingsDisplayController);

function CalSettingsDisplayController(
  $state,
  asyncAction,
  calFullUiConfiguration,
  esnUserConfigurationService,
  calSettingsService,
  CAL_USER_CONFIGURATION,
  CAL_SETTINGS_STATUS
) {
  var self = this;

  self.$onInit = $onInit;
  self.submit = submit;

  function $onInit() {
    esnUserConfigurationService.get(CAL_USER_CONFIGURATION.keys, CAL_USER_CONFIGURATION.moduleName)
      .then(function(configurationsArray) {
        self.configurations = _arrayToObject(configurationsArray);
      });
  }

  function _arrayToObject(configurationsArray) {
    var output = {};

    configurationsArray.forEach(function(configuration) {
      output[configuration.name] = configuration.value;
    });

    return output;
  }

  function submit() {
    return asyncAction({
      progressing: 'Saving configuration...',
      success: 'Configuration saved',
      failure: 'Failed to save configuration'
    }, _submit);
  }

  function _submit() {
    var configurationsArray = _.map(self.configurations, function(value, key) {
      return {
        name: key,
        value: value || false
      };
    });

    calSettingsService.updateStatus(CAL_SETTINGS_STATUS.UPDATING);

    return esnUserConfigurationService.set(configurationsArray, CAL_USER_CONFIGURATION.moduleName)
      .then(function() {
        calSettingsService.updateStatus(CAL_SETTINGS_STATUS.UPDATED);
        calFullUiConfiguration.setHiddenDeclinedEvents(self.configurations.hideDeclinedEvents);
      })
      .catch(() => {
        calSettingsService.updateStatus(CAL_SETTINGS_STATUS.FAILED);
      });
  }
}
