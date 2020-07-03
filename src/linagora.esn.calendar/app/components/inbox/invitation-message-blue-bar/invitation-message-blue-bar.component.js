(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calInboxInvitationMessageBlueBar', {
      controller: 'calInboxInvitationMessageBlueBarController',
      bindings: {
        message: '<'
      },
      template: require("./invitation-message-blue-bar.pug")
    });
})(angular);
