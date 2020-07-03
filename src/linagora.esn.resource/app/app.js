(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource', [
    'esn.attendee',
    'esn.session',
    'esn.user',
    'op.dynamicDirective',
    'esn.lodash-wrapper',
    'ui.router',
    'mgcrea.ngStrap.modal',
    'restangular'
  ]);
})(angular);
