'use strict';

angular.module('esn.calendar')

  .run(function(dynamicDirectiveService, DynamicDirective, _, X_OPENPAAS_CAL_HEADERS) {
    var directive = new DynamicDirective(true, 'cal-inbox-resource-management-indicator', {
      attributes: [
        { name: 'ng-if', value: 'item.headers["' + X_OPENPAAS_CAL_HEADERS.ACTION + '"]' }
      ]
    });

    dynamicDirectiveService.addInjection('inbox-message-indicators', directive);
  });
