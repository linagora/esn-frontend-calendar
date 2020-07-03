(function(angular) {
  'use strict';

  angular.module('esn.calendar').run(runBlock);

  function runBlock(dynamicDirectiveService, DynamicDirective, _, INVITATION_MESSAGE_HEADERS, X_OPENPAAS_CAL_HEADERS, X_OPENPAAS_CAL_VALUES) {
    var shouldInject = function(scope) {
      return scope.email &&
        scope.email.headers &&
        scope.email.headers[X_OPENPAAS_CAL_HEADERS.ACTION] === X_OPENPAAS_CAL_VALUES.RESOURCE_REQUEST;
    };
    var directive = new DynamicDirective(shouldInject, 'cal-inbox-resource-management-blue-bar', {
      attributes: [{ name: 'message', value: 'email' }]
    });

    dynamicDirectiveService.addInjection('inbox-message-info', directive);
  }
})(angular);
