const _ = require('lodash');
require('../../../components/inbox/inbox.constants.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar').run(runBlock);

  function runBlock(dynamicDirectiveService, DynamicDirective, INVITATION_MESSAGE_HEADERS) {
    var shouldInject = function(scope) {
      return scope.email &&
        scope.email.headers &&
        INVITATION_MESSAGE_HEADERS.UID in scope.email.headers;
    };
    var directive = new DynamicDirective(shouldInject, 'cal-inbox-invitation-message-blue-bar', {
      attributes: [{ name: 'message', value: 'email' }]
    });

    dynamicDirectiveService.addInjection('inbox-message-info', directive);
  }
})(angular);
