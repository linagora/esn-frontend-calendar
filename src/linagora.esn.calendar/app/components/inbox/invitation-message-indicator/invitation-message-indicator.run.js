const _ = require('lodash');

require('../../../components/inbox/inbox.constants.js');

(function(angular) {
'use strict';

angular.module('esn.calendar')

  .run(function(dynamicDirectiveService, DynamicDirective, INVITATION_MESSAGE_HEADERS) {
    var directive = new DynamicDirective(true, 'cal-inbox-invitation-message-indicator', {
      attributes: [
        { name: 'ng-if', value: 'item.headers["' + INVITATION_MESSAGE_HEADERS.UID + '"]' }
      ]
    });

    dynamicDirectiveService.addInjection('inbox-message-indicators', directive);
  });
})(angular);
