(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('ESNResourceUpdateModalController', ESNResourceUpdateModalController);

  function ESNResourceUpdateModalController($modal) {
    var self = this;

    self.openResourceUpdateModal = openResourceUpdateModal;

    function openResourceUpdateModal() {
      $modal({
        template: require("../components/resource-form-modal/resource-form-modal.pug"),
        controller: 'ESNResourceFormUpdateController',
        backdrop: 'static',
        placement: 'center',
        controllerAs: 'ctrl',
        locals: {
          resource: self.resource,
          type: self.type
        }
      });
    }
  }
})(angular);
