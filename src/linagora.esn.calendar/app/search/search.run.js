(function() {
  'use strict';

  angular.module('esn.calendar')
    .run(runBlock);

  function runBlock($log, searchProviders, calSearchEventProviderService) {
    calSearchEventProviderService()
      .then(function(provider) {
        searchProviders.add(provider);
      })
      .catch(function(err) {
        $log.error('Can not build and register the calendar search provider', err);
      });
  }
})();
