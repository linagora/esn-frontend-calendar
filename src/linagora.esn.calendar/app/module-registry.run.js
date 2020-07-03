(function(angular) {
  'use strict';

  angular.module('esn.calendar').run(runBlock);

  function runBlock(
    esnModuleRegistry,
    CAL_MODULE_METADATA
  ) {
    esnModuleRegistry.add(CAL_MODULE_METADATA);
  }
})(angular);
