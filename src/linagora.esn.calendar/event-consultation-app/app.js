(function(angular) {
  'use strict';

  angular.module('esn.calendar.event-consultation', [
    'AngularJstz',
    'ngSanitize',
    'esn.avatar',
    'esn.core',
    'esn.lodash-wrapper',
    'esn.calendar',
    'esn.calMoment',
    'esn.constants',
    'esn.constants',
    'esn.core',
    'esn.cache',
    'esn.header',
    'esn.http',
    'esn.i18n',
    'esn.ical',
    'esn.lodash-wrapper',
    'esn.notification',
    'esn.object-type',
    'esn.user',
    'esn.url',
    'mgcrea.ngStrap.popover',
    'ngSanitize',
    'op.dynamicDirective',
    'restangular',
    'ngPromiseExtras',
    'uuid4'
  ]);

  //mock parent calendars to be able to use the consult-form-directive
  angular.module('esn.calendar', [])
    .service('calEventAPI', angular.noop)
    .service('calMasterEventCache', angular.noop)
    .factory('calResourceService', function($q) {
      return {
        getResourceIcon: function() { return $q.when(); }
      };
    });
  angular.module('esn.avatar', []);
  angular.module('esn.ui', []);
  angular.module('esn.header', []).service('headerService', function() {});
})(angular);
