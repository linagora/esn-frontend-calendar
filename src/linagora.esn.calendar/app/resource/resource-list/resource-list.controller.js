(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalResourceListController', CalResourceListController);

  function CalResourceListController() {
    var self = this;

    self.removeResource = removeResource;

    function removeResource(resource) {
      self.onResourceRemoved && self.onResourceRemoved({resource: resource});
    }
  }

})();
