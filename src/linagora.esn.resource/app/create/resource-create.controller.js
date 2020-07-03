(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('ESNResourceCreateModalController', ESNResourceCreateModalController);

  function ESNResourceCreateModalController($modal) {
    var self = this;

    self.openResourceCreateModal = openResourceCreateModal;

    function openResourceCreateModal() {
      $modal({
        template: require("../components/resource-form-modal/resource-form-modal.pug"),
        controller: 'ESNResourceFormCreateController',
        backdrop: 'static',
        placement: 'center',
        controllerAs: 'ctrl',
        locals: {
          type: self.type
        }
      });
    }
  }
})(angular);
