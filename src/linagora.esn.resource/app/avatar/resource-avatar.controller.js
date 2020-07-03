(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('esnResourceAvatarController', esnResourceAvatarController);

  function esnResourceAvatarController(ESN_RESOURCE) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.resourceName = self.resource.name || self.resource.displayName;
      self.resourceIcon = ESN_RESOURCE.ICONS[self.resource.icon];
    }
  }
})(angular);
