(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .constant('CAL_FREEBUSY', {
      UNKNOWN: 'unknown',
      FREE: 'free',
      BUSY: 'busy',
      LOADING: 'loading'
    });
})(angular);
