require('../../../constants.js');
require('../../../services/calendar-resource.service.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalResourceAvatarController', CalResourceAvatarController);

  function CalResourceAvatarController(calResourceService, ESN_RESOURCE) {
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
})(angular);
