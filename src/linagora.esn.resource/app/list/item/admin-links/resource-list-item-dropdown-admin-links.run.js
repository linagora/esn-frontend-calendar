(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .run(function(dynamicDirectiveService, DynamicDirective, session, _) {
      function isAdmin(resource, user) {
        return resource && _.find(resource.administrators, { objectType: 'user', id: user._id });
      }

      function creatorCanAdministrate(resource, user) {
        return resource.administrators.length === 0 && resource.creator === user._id;
      }

      function canAdministrate(scope) {
        return isAdmin(scope.ctrl.resource, session.user) || creatorCanAdministrate(scope.ctrl.resource, session.user);
      }

      session.ready.then(function() {
        var directive = new DynamicDirective(canAdministrate, 'esn-resource-list-item-dropdown-admin-links');

        dynamicDirectiveService.addInjection('esn-resource-list-item-dropdown', directive);
      });
    });
})(angular);
