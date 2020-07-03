(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceCreateModal', {
      bindings: {
        type: '=?'
      },
      controller: ComponentController,
      controllerAs: 'ctrl',
      transclude: true,
      template: require("./resource-create.pug")
    });

    function ComponentController($modal) {
      var self = this;

      self.openResourceCreateModal = openResourceCreateModal;

      function openResourceCreateModal() {
        $modal({
          template: require("../components/resource-form-modal/resource-form-modal.pug"),
          controller: 'ESNResourceFormCreateController',
          backdrop: 'static',
          placement: 'center',
          controllerAs: 'ctrl',
          resolve: {
            type: function() { return self.type; }
          }
        });
      }
    }
})(angular);
