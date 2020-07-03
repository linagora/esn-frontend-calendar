(function() {
  'use strict';

  angular.module('esn.calendar')
    .run(runBlock);

  function runBlock(calRegisterTimezones) {
    calRegisterTimezones();
  }
})();
