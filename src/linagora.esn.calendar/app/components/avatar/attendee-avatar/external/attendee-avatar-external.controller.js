(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalAttendeeExternalAvatarController', CalAttendeeExternalAvatarController);

  function CalAttendeeExternalAvatarController(esnAvatarUrlService) {
    var self = this;

    self.$onInit = $onInit;
    self.getDisplayName = getDisplayName;

    function $onInit() {
      self.avatarUrl = esnAvatarUrlService.generateUrl(self.attendee.email);
    }

    function getDisplayName() {
      return self.attendee.name || self.attendee.displayName;
    }
  }
})();
