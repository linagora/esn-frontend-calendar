(function(angular) {
  'use strict';

  angular.module('esn.calendar.event-error-display', [
    'ngSanitize',
    'esn.lodash-wrapper',
    'esn.constants',
    'esn.header',
    'esn.http',
    'esn.i18n',
    'mgcrea.ngStrap.popover',
    'ngSanitize',
    'restangular',
    'uuid4'
  ]);

  angular.module('esn.avatar', []);
  angular.module('esn.ui', []);
  angular.module('esn.header', []).service('headerService', function() {});
})(angular);
