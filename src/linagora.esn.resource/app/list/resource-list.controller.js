(function() {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('ESNResourceListController', ESNResourceListController);

  function ESNResourceListController(infiniteScrollHelper, esnResourceAPIClient) {
    var self = this;
    var DEFAULT_LIMIT = 20;
    var options = {
      offset: 0,
      limit: DEFAULT_LIMIT
    };

    self.$onInit = $onInit;

    function $onInit() {
      if (self.type) {
        options.type = self.type;
      }

      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);
    }

    function _loadNextItems() {
      options.offset = self.elements.length;

      return esnResourceAPIClient.list(options)
        .then(function(response) {
          return response.data;
        });
    }
  }
})();
