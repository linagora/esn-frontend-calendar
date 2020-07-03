(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalResourceAvatarController', CalResourceAvatarController);

  function CalResourceAvatarController($log, esnAvatarUrlService, calResourceService, CAL_ICAL, ESN_RESOURCE) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.resourceName = self.resource.name || self.resource.displayName;
      self.resourceIcon = ESN_RESOURCE.DEFAULT_ICON;
      calResourceService.getResourceIcon(self.resource.email.split('@')[0])
        .then(function(resourceIcon) {
          self.resourceIcon = resourceIcon || self.resourceIcon;
        });
    }
  }
})();
