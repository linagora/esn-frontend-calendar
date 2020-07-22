'use strict';

angular.module('esn.calendar.libs')
  .controller('CalResourceListController', CalResourceListController);

function CalResourceListController() {
  var self = this;

  self.removeResource = removeResource;

  function removeResource(resource) {
    self.onResourceRemoved && self.onResourceRemoved({resource: resource});
  }
}