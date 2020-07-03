(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalResourceItemController', CalResourceItemController);

  function CalResourceItemController(CAL_RESOURCE, CAL_FREEBUSY) {
    var self = this;

    self.$onInit = $onInit;
    self.$onChanges = $onChanges;
    self.removeResource = removeResource;

    function $onInit() {
      self.PARTSTAT_ICONS = CAL_RESOURCE.PARTSTAT_ICONS;
      self.CAL_FREEBUSY = CAL_FREEBUSY;
    }

    function $onChanges(resourcesChanges) {
      self.DELETED_ICONS = resourcesChanges.resource.currentValue.deleted ? CAL_RESOURCE.DELETED_ICON : '';
    }

    function removeResource() {
      self.remove && self.remove({resource: self.resource});
    }
  }

})();
