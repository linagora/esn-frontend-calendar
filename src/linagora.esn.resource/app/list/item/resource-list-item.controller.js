(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('esnResourceListItemController', esnResourceListItemController);

    function esnResourceListItemController($state, esnResourceAPIClient) {
      var self = this;

      self.onDelete = onDelete;

      function onDelete() {
        esnResourceAPIClient.remove(self.resource._id).then(function() {
          $state.reload();
        });
      }
    }
})(angular);
